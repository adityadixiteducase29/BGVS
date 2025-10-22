const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class User {
    constructor(userData) {
        this.id = userData.id || null;
        this.email = userData.email;
        this.password = userData.password;
        this.first_name = userData.first_name;
        this.last_name = userData.last_name;
        this.user_type = userData.user_type || 'verifier';
        this.is_active = userData.is_active !== undefined ? userData.is_active : true;
    }

    // Get full name
    get fullName() {
        return `${this.first_name} ${this.last_name}`;
    }

    // Hash password
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, config.bcryptRounds);
    }

    // Generate JWT token
    generateToken() {
        if (!this.id) {
            throw new Error('Cannot generate token: User ID not set');
        }
        
        return jwt.sign(
            { 
                id: this.id,
                email: this.email,
                user_type: this.user_type,
                full_name: this.fullName
            }, 
            config.jwtSecret, 
            { expiresIn: config.jwtExpiresIn }
        );
    }

    // Save user to database
    async save() {
        try {
            const [result] = await pool.execute(
                'INSERT INTO users (email, password, first_name, last_name, user_type, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [this.email, this.password, this.first_name, this.last_name, this.user_type, this.is_active]
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('User with this email already exists');
            }
            throw new Error('Failed to create user');
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find user');
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find user');
        }
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Get all users by type
    static async findByType(userType) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, email, first_name, last_name, user_type, is_active, created_at FROM users WHERE user_type = ? AND is_active = TRUE',
                [userType]
            );
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch users');
        }
    }

    // Get all verifiers with their company assignments
    static async getAllVerifiersWithAssignments() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    u.id, u.email, u.first_name, u.last_name, u.created_at,
                    GROUP_CONCAT(c.name SEPARATOR ', ') as assigned_companies
                FROM users u
                LEFT JOIN verifier_assignments va ON u.id = va.verifier_id AND va.is_active = TRUE
                LEFT JOIN companies c ON va.company_id = c.id AND c.is_active = TRUE
                WHERE u.user_type = 'verifier' AND u.is_active = TRUE
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch verifiers with assignments');
        }
    }

    // Get verifier's assigned companies
    async getAssignedCompanies() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    c.id, c.name, c.industry, c.verification_form_link,
                    va.assigned_at
                FROM verifier_assignments va
                JOIN companies c ON va.company_id = c.id
                WHERE va.verifier_id = ? AND va.is_active = TRUE AND c.is_active = TRUE
                ORDER BY va.assigned_at DESC
            `, [this.id]);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch assigned companies');
        }
    }

    // Update user
    async update(updateData) {
        try {
            const allowedFields = ['first_name', 'last_name', 'email', 'is_active'];
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key)) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(this.id);
            const [result] = await pool.execute(
                `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to update user');
        }
    }

    // Change password
    async changePassword(newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);
            const [result] = await pool.execute(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to change password');
        }
    }

    // Deactivate user
    async deactivate() {
        try {
            const [result] = await pool.execute(
                'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to deactivate user');
        }
    }

    // Check if user is admin
    isAdmin() {
        return this.user_type === 'admin';
    }

    // Check if user is verifier
    isVerifier() {
        return this.user_type === 'verifier';
    }

    // Check if user is company
    isCompany() {
        return this.user_type === 'company';
    }

    // Validate user permissions for specific actions
    canPerformAction(action) {
        switch (action) {
            case 'create_company':
            case 'manage_verifiers':
            case 'view_all_applications':
            case 'assign_applications':
                return this.isAdmin();
            
            case 'view_assigned_applications':
            case 'review_applications':
            case 'approve_applications':
            case 'reject_applications':
                return this.isVerifier();
            
            case 'view_company_applications':
            case 'view_company_stats':
                return this.isCompany();
            
            default:
                return false;
        }
    }

    // Get user dashboard data based on role
    async getDashboardData() {
        try {
            if (this.isAdmin()) {
                return await this.getAdminDashboardData();
            } else if (this.isVerifier()) {
                return await this.getVerifierDashboardData();
            } else if (this.isCompany()) {
                return await this.getCompanyDashboardData();
            }
            return null;
        } catch (error) {
            throw new Error('Failed to get dashboard data');
        }
    }

    // Get admin dashboard data
    async getAdminDashboardData() {
        try {
            const [userStats] = await pool.execute(`
                SELECT 
                    user_type,
                    COUNT(*) as count,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
                FROM users 
                GROUP BY user_type
            `);

            const [companyStats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_companies,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_companies
                FROM companies
            `);

            const [applicationStats] = await pool.execute(`
                SELECT 
                    application_status,
                    COUNT(*) as count
                FROM applications 
                GROUP BY application_status
            `);

            return {
                userStats,
                companyStats: companyStats[0],
                applicationStats
            };
        } catch (error) {
            throw new Error('Failed to get admin dashboard data');
        }
    }

    // Get verifier dashboard data
    async getVerifierDashboardData() {
        try {
            const [assignedCompanies] = await pool.execute(`
                SELECT 
                    c.id, c.name, c.industry,
                    COUNT(a.id) as total_applications,
                    COUNT(CASE WHEN a.application_status = 'pending' THEN 1 END) as pending_applications,
                    COUNT(CASE WHEN a.application_status = 'assigned' THEN 1 END) as assigned_applications,
                    COUNT(CASE WHEN a.application_status = 'under_review' THEN 1 END) as under_review_applications
                FROM verifier_assignments va
                JOIN companies c ON va.company_id = c.id
                LEFT JOIN applications a ON c.id = a.company_id
                WHERE va.verifier_id = ? AND va.is_active = TRUE AND c.is_active = TRUE
                GROUP BY c.id
            `, [this.id]);

            const [myApplications] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_assigned,
                    COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN application_status = 'assigned' THEN 1 END) as assigned,
                    COUNT(CASE WHEN application_status = 'under_review' THEN 1 END) as under_review,
                    COUNT(CASE WHEN application_status = 'approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected
                FROM applications 
                WHERE assigned_verifier_id = ?
            `, [this.id]);

            return {
                assignedCompanies,
                myApplications: myApplications[0]
            };
        } catch (error) {
            throw new Error('Failed to get verifier dashboard data');
        }
    }

    // Get company dashboard data
    async getCompanyDashboardData() {
        try {
            // For company users, we'll need to implement company lookup logic
            // This is a placeholder for future implementation
            return {
                message: 'Company dashboard data not yet implemented'
            };
        } catch (error) {
            throw new Error('Failed to get company dashboard data');
        }
    }

    // Get user statistics
    static async getStats() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    user_type,
                    COUNT(*) as count,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
                FROM users 
                GROUP BY user_type
            `);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch user statistics');
        }
    }
}

module.exports = User;
