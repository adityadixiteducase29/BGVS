const User = require('../models/User');
const { pool } = require('../config/database');

class EmployeeController {
    // Get all employees (verifiers)
    static async getAllEmployees(req, res) {
        try {
            const [employees] = await pool.execute(`
                SELECT 
                    u.id,
                    u.email,
                    CONCAT(u.first_name, ' ', u.last_name) as name,
                    u.user_type,
                    u.is_active as status,
                    u.created_at,
                    COUNT(va.company_id) as assigned_companies_count,
                    GROUP_CONCAT(va.company_id SEPARATOR ',') as assigned_company_ids,
                    GROUP_CONCAT(c.name SEPARATOR ',') as assigned_company_names
                FROM users u
                LEFT JOIN verifier_assignments va ON u.id = va.verifier_id AND va.is_active = TRUE
                LEFT JOIN companies c ON va.company_id = c.id AND c.is_active = TRUE
                WHERE u.user_type = 'verifier' AND u.is_active = TRUE
                GROUP BY u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_active, u.created_at
                ORDER BY u.created_at DESC
            `);

            // Transform the data to include assigned companies as array
            const transformedEmployees = employees.map(emp => ({
                ...emp,
                status: emp.status ? 'active' : 'inactive',
                assigned_company_ids: emp.assigned_company_ids ? emp.assigned_company_ids.split(',').map(id => parseInt(id)) : [],
                assigned_company_names: emp.assigned_company_names ? emp.assigned_company_names.split(',') : [],
                assigned_companies_count: parseInt(emp.assigned_companies_count) || 0
            }));

            res.status(200).json({
                success: true,
                data: transformedEmployees
            });
        } catch (error) {
            console.error('Error fetching employees:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch employees',
                error: error.message
            });
        }
    }

    // Create new employee (verifier)
    static async createEmployee(req, res) {
        try {
            const { name, email, password, assignToCompany } = req.body;

            // Validate required fields
            if (!name || !email || !password || !assignToCompany || assignToCompany.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, password, and at least one company assignment are required'
                });
            }

            // Split name into first and last name
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Create user
            const userData = {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                user_type: 'verifier',
                is_active: true
            };

            const user = new User(userData);
            await user.hashPassword();
            const savedUser = await user.save();

            // Assign to companies
            if (assignToCompany && assignToCompany.length > 0) {
                const assignmentValues = assignToCompany.map(companyId => 
                    [savedUser.id, companyId, req.user.id]
                );

                await pool.execute(`
                    INSERT INTO verifier_assignments (verifier_id, company_id, assigned_by) 
                    VALUES ${assignmentValues.map(() => '(?, ?, ?)').join(',')}
                `, assignmentValues.flat());
            }

            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: {
                    id: savedUser.id,
                    name: savedUser.fullName,
                    email: savedUser.email,
                    user_type: savedUser.user_type,
                    assigned_companies: assignToCompany
                }
            });
        } catch (error) {
            console.error('Error creating employee:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create employee',
                error: error.message
            });
        }
    }

    // Get employee by ID
    static async getEmployeeById(req, res) {
        try {
            const { id } = req.params;

            const [employees] = await pool.execute(`
                SELECT 
                    u.id,
                    u.email,
                    CONCAT(u.first_name, ' ', u.last_name) as name,
                    u.user_type,
                    u.is_active as status,
                    u.created_at,
                    GROUP_CONCAT(c.id SEPARATOR ',') as assigned_company_ids,
                    GROUP_CONCAT(c.name SEPARATOR ',') as assigned_companies
                FROM users u
                LEFT JOIN verifier_assignments va ON u.id = va.verifier_id AND va.is_active = TRUE
                LEFT JOIN companies c ON va.company_id = c.id AND c.is_active = TRUE
                WHERE u.id = ? AND u.user_type = 'verifier' AND u.is_active = TRUE
                GROUP BY u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_active, u.created_at
            `, [id]);

            if (employees.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee not found'
                });
            }

            const employee = employees[0];
            const transformedEmployee = {
                ...employee,
                status: employee.status ? 'active' : 'inactive',
                assigned_company_ids: employee.assigned_company_ids ? employee.assigned_company_ids.split(',').map(id => parseInt(id)) : [],
                assigned_companies: employee.assigned_companies ? employee.assigned_companies.split(',') : []
            };

            res.status(200).json({
                success: true,
                data: transformedEmployee
            });
        } catch (error) {
            console.error('Error fetching employee:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch employee',
                error: error.message
            });
        }
    }

    // Update employee
    static async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const { name, email, password, assignToCompany } = req.body;

            // Check if employee exists
            const existingEmployee = await User.findById(id);
            if (!existingEmployee || existingEmployee.user_type !== 'verifier') {
                return res.status(404).json({
                    success: false,
                    message: 'Employee not found'
                });
            }

            // Update user information
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            // If password is provided, hash it
            if (password) {
                const bcrypt = require('bcrypt');
                const hashedPassword = await bcrypt.hash(password, 12);
                
                await pool.execute(`
                    UPDATE users 
                    SET first_name = ?, last_name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [firstName, lastName, email, hashedPassword, id]);
            } else {
                // Update without changing password
                await pool.execute(`
                    UPDATE users 
                    SET first_name = ?, last_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [firstName, lastName, email, id]);
            }

            // Update company assignments
            if (assignToCompany) {
                // Delete existing assignments completely
                await pool.execute(`
                    DELETE FROM verifier_assignments 
                    WHERE verifier_id = ?
                `, [id]);

                // Add new assignments
                if (assignToCompany.length > 0) {
                    const assignmentValues = assignToCompany.map(companyId => 
                        [id, companyId, req.user.id]
                    );

                    await pool.execute(`
                        INSERT INTO verifier_assignments (verifier_id, company_id, assigned_by) 
                        VALUES ${assignmentValues.map(() => '(?, ?, ?)').join(',')}
                    `, assignmentValues.flat());
                }
            }

            res.status(200).json({
                success: true,
                message: 'Employee updated successfully'
            });
        } catch (error) {
            console.error('Error updating employee:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update employee',
                error: error.message
            });
        }
    }

    // Delete employee (hard delete with cascading)
    static async deleteEmployee(req, res) {
        try {
            const { id } = req.params;

            // Start transaction for data integrity
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First, check if employee exists and get details
                const [employees] = await connection.execute(`
                    SELECT id, first_name, last_name, email, user_type 
                    FROM users 
                    WHERE id = ? AND user_type = 'verifier' AND is_active = TRUE
                `, [id]);

                if (employees.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Employee not found'
                    });
                }

                const employee = employees[0];
                console.log(`Deleting employee ${id}: ${employee.first_name} ${employee.last_name}`);

                // Check if employee has any verification history (this would prevent deletion due to RESTRICT FK)
                const [historyCheck] = await connection.execute(`
                    SELECT COUNT(*) as count FROM verification_history WHERE verifier_id = ?
                `, [id]);

                if (historyCheck[0].count > 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot delete employee: Employee has verification history. Please deactivate instead.'
                    });
                }

                // Check if employee has any assigned applications
                const [applicationsCheck] = await connection.execute(`
                    SELECT COUNT(*) as count FROM applications WHERE assigned_verifier_id = ?
                `, [id]);

                if (applicationsCheck[0].count > 0) {
                    // Unassign applications from this verifier
                    await connection.execute(`
                        UPDATE applications 
                        SET assigned_verifier_id = NULL, assigned_at = NULL, updated_at = CURRENT_TIMESTAMP
                        WHERE assigned_verifier_id = ?
                    `, [id]);
                    console.log(`Unassigned ${applicationsCheck[0].count} applications from verifier`);
                }

                // Delete in correct order (child tables first due to foreign key constraints)
                
                // 1. Delete field reviews (CASCADE)
                await connection.execute(`
                    DELETE FROM field_reviews WHERE reviewed_by = ?
                `, [id]);
                console.log('Deleted field reviews');

                // 2. Delete file reviews (CASCADE)
                await connection.execute(`
                    DELETE FROM file_reviews WHERE reviewed_by = ?
                `, [id]);
                console.log('Deleted file reviews');

                // 3. Delete application reviews (CASCADE)
                await connection.execute(`
                    DELETE FROM application_reviews WHERE reviewed_by = ?
                `, [id]);
                console.log('Deleted application reviews');

                // 4. Delete verifier assignments (CASCADE)
                await connection.execute(`
                    DELETE FROM verifier_assignments WHERE verifier_id = ?
                `, [id]);
                console.log('Deleted verifier assignments');

                // 5. Finally, delete the user
                await connection.execute(`
                    DELETE FROM users WHERE id = ?
                `, [id]);
                console.log('Deleted user');

                // Commit transaction
                await connection.commit();
                connection.release();

                res.status(200).json({
                    success: true,
                    message: 'Employee deleted successfully',
                    data: {
                        deletedEmployeeId: id,
                        employeeName: `${employee.first_name} ${employee.last_name}`,
                        unassignedApplications: parseInt(applicationsCheck[0].count) || 0
                    }
                });

            } catch (error) {
                // Rollback transaction on error
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error deleting employee:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get employee dashboard statistics
    static async getEmployeeStats(req, res) {
        try {
            const [statsResult] = await pool.execute(`
                SELECT 
                    COUNT(DISTINCT u.id) as total_employees,
                    COUNT(DISTINCT a.id) as total_verifications,
                    COUNT(DISTINCT CASE WHEN a.application_status = 'pending' THEN a.id END) as pending_verifications,
                    COUNT(DISTINCT CASE WHEN a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN a.id END) as this_week_verifications
                FROM users u
                LEFT JOIN verifier_assignments va ON u.id = va.verifier_id AND va.is_active = TRUE
                LEFT JOIN companies c ON va.company_id = c.id AND c.is_active = TRUE
                LEFT JOIN applications a ON c.id = a.company_id
                WHERE u.user_type = 'verifier' AND u.is_active = TRUE
            `);

            const stats = statsResult[0];
            res.status(200).json({
                success: true,
                data: {
                    total_employees: parseInt(stats.total_employees) || 0,
                    total_verifications: parseInt(stats.total_verifications) || 0,
                    pending_verifications: parseInt(stats.pending_verifications) || 0,
                    this_week_verifications: parseInt(stats.this_week_verifications) || 0
                }
            });
        } catch (error) {
            console.error('Error fetching employee stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch employee statistics',
                error: error.message
            });
        }
    }
}

module.exports = EmployeeController;
