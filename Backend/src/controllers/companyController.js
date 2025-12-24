const Company = require('../models/Company');
const bcrypt = require('bcrypt');
const config = require('../config/environment');

class CompanyController {
    // Create a new company
    static async createCompany(req, res) {
        try {
            const companyData = req.body;
            companyData.created_by = req.user.id;

            // Check if company with this email already exists
            const existingCompany = await Company.findByEmail(companyData.email);
            if (existingCompany) {
                return res.status(400).json({
                    success: false,
                    message: 'Company with this email already exists'
                });
            }

            // Create new company
            const company = new Company(companyData);
            const savedCompany = await company.save();

            // Save services if provided
            if (companyData.services) {
                await savedCompany.saveServices(companyData.services);
            }

            res.status(201).json({
                success: true,
                message: 'Company created successfully',
                data: {
                    id: savedCompany.id,
                    name: savedCompany.name,
                    email: savedCompany.email,
                    verification_form_link: `${config.frontendUrl}/user-form/${savedCompany.id}`
                }
            });

        } catch (error) {
            console.error('Error creating company:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all companies
    static async getAllCompanies(req, res) {
        try {
            // If user is a company (not admin), only show their company and sub-companies
            let companyId = null;
            if (req.user && req.user.user_type === 'company') {
                companyId = req.user.id;
            }
            
            const companies = await Company.findAll(companyId);

            res.status(200).json({
                success: true,
                data: companies
            });

        } catch (error) {
            console.error('Error fetching companies:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get company by ID
    static async getCompanyById(req, res) {
        try {
            const { id } = req.params;
            const company = await Company.findById(id);

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Get company services
            const services = await Company.getCompanyServices(id);

            res.status(200).json({
                success: true,
                data: {
                    ...company,
                    services
                }
            });

        } catch (error) {
            console.error('Error fetching company:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update company
    static async updateCompany(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const companyData = await Company.findById(id);
            if (!companyData) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Create a Company instance and update fields
            const company = new Company(companyData);
            Object.assign(company, updateData);
            await company.update();

            res.status(200).json({
                success: true,
                message: 'Company updated successfully'
            });

        } catch (error) {
            console.error('Error updating company:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update company services
    static async updateCompanyServices(req, res) {
        try {
            const { id } = req.params;
            const { services } = req.body;

            const company = await Company.findById(id);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Create a new Company instance to use the saveServices method
            const companyInstance = new Company(company);
            companyInstance.id = company.id;
            await companyInstance.saveServices(services);

            res.status(200).json({
                success: true,
                message: 'Company services updated successfully'
            });

        } catch (error) {
            console.error('Error updating company services:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update sub-companies (assign multiple companies as sub-companies)
    static async updateSubCompanies(req, res) {
        try {
            const { id } = req.params; // Parent company ID
            const { subCompanyIds } = req.body; // Array of company IDs to assign as sub-companies

            const { pool } = require('../config/database');

            // Check if parent company exists
            const parentCompany = await Company.findById(id);
            if (!parentCompany) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent company not found'
                });
            }

            // Check if parent_company_id column exists
            const hasParentColumn = await Company.hasParentCompanyColumn();
            if (!hasParentColumn) {
                return res.status(400).json({
                    success: false,
                    message: 'Database migration required: Please run migration_add_parent_company.sql to add parent_company_id column.'
                });
            }

            // Validate subCompanyIds is an array
            if (!Array.isArray(subCompanyIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'subCompanyIds must be an array'
                });
            }

            // Start transaction
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First, remove all existing sub-companies (set their parent_company_id to NULL)
                await connection.execute(
                    'UPDATE companies SET parent_company_id = NULL WHERE parent_company_id = ?',
                    [id]
                );

                // Then, assign new sub-companies
                if (subCompanyIds.length > 0) {
                    // Validate that all sub-company IDs exist and are not the parent itself
                    const placeholders = subCompanyIds.map(() => '?').join(',');
                    const [existingCompanies] = await connection.execute(
                        `SELECT id FROM companies WHERE id IN (${placeholders}) AND id != ? AND is_active = TRUE`,
                        [...subCompanyIds, id]
                    );

                    const existingIds = existingCompanies.map(c => c.id);
                    const invalidIds = subCompanyIds.filter(id => !existingIds.includes(parseInt(id)));

                    if (invalidIds.length > 0) {
                        await connection.rollback();
                        connection.release();
                        return res.status(400).json({
                            success: false,
                            message: `Invalid company IDs: ${invalidIds.join(', ')}`
                        });
                    }

                    // Update each sub-company to have this company as parent
                    for (const subCompanyId of subCompanyIds) {
                        await connection.execute(
                            'UPDATE companies SET parent_company_id = ? WHERE id = ?',
                            [id, subCompanyId]
                        );
                    }
                }

                await connection.commit();
                connection.release();

                res.status(200).json({
                    success: true,
                    message: 'Sub-companies updated successfully',
                    data: {
                        parentCompanyId: id,
                        subCompanyIds: subCompanyIds
                    }
                });

            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error updating sub-companies:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete company (hard delete with cascading)
    static async deactivateCompany(req, res) {
        try {
            const { id } = req.params;
            const { pool } = require('../config/database');

            // Start transaction for data integrity
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First, check if company exists and get details
                const [companies] = await connection.execute(`
                    SELECT id, name, email, is_active 
                    FROM companies 
                    WHERE id = ?
                `, [id]);

                if (companies.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Company not found'
                    });
                }

                const company = companies[0];
                console.log(`Deleting company ${id}: ${company.name}`);

                // Check if company has any applications
                const [applicationsCheck] = await connection.execute(`
                    SELECT COUNT(*) as count FROM applications WHERE company_id = ?
                `, [id]);

                // Get all file paths before deleting for cleanup (even if no applications)
                const [documents] = await connection.execute(`
                    SELECT file_path FROM application_documents ad
                    INNER JOIN applications a ON ad.application_id = a.id
                    WHERE a.company_id = ?
                `, [id]);

                if (applicationsCheck[0].count > 0) {
                    // Delete in correct order (child tables first due to foreign key constraints)
                    
                    // 1. Delete field reviews
                    await connection.execute(`
                        DELETE fr FROM field_reviews fr
                        INNER JOIN applications a ON fr.application_id = a.id
                        WHERE a.company_id = ?
                    `, [id]);
                    console.log('Deleted field reviews');

                    // 2. Delete file reviews
                    await connection.execute(`
                        DELETE fr FROM file_reviews fr
                        INNER JOIN applications a ON fr.application_id = a.id
                        WHERE a.company_id = ?
                    `, [id]);
                    console.log('Deleted file reviews');

                    // 3. Delete application reviews
                    await connection.execute(`
                        DELETE ar FROM application_reviews ar
                        INNER JOIN applications a ON ar.application_id = a.id
                        WHERE a.company_id = ?
                    `, [id]);
                    console.log('Deleted application reviews');

                    // 4. Delete verification history
                    await connection.execute(`
                        DELETE vh FROM verification_history vh
                        INNER JOIN applications a ON vh.application_id = a.id
                        WHERE a.company_id = ?
                    `, [id]);
                    console.log('Deleted verification history');

                    // 5. Delete application documents (this will also delete files from disk)
                    await connection.execute(`
                        DELETE ad FROM application_documents ad
                        INNER JOIN applications a ON ad.application_id = a.id
                        WHERE a.company_id = ?
                    `, [id]);
                    console.log('Deleted application documents');

                    // 6. Delete applications
                    await connection.execute(`
                        DELETE FROM applications WHERE company_id = ?
                    `, [id]);
                    console.log('Deleted applications');
                }

                // Clean up files from disk (if any)
                if (documents.length > 0) {
                    const fileStorageService = new (require('../services/FileStorageService'))();
                    for (const doc of documents) {
                        try {
                            await fileStorageService.deleteFileByPath(doc.file_path);
                        } catch (fileError) {
                            console.error(`Error deleting file ${doc.file_path}:`, fileError);
                            // Don't fail the entire operation if file deletion fails
                        }
                    }
                }

                // 7. Delete verifier assignments
                await connection.execute(`
                    DELETE FROM verifier_assignments WHERE company_id = ?
                `, [id]);
                console.log('Deleted verifier assignments');

                // 8. Delete company services
                await connection.execute(`
                    DELETE FROM company_services WHERE company_id = ?
                `, [id]);
                console.log('Deleted company services');

                // 9. Finally, delete the company itself
                await connection.execute(`
                    DELETE FROM companies WHERE id = ?
                `, [id]);
                console.log('Deleted company');

                // Commit transaction
                await connection.commit();
                connection.release();

                res.status(200).json({
                    success: true,
                    message: 'Company deleted successfully',
                    data: {
                        deletedCompanyId: id,
                        companyName: company.name,
                        deletedApplications: parseInt(applicationsCheck[0].count) || 0,
                        deletedFiles: applicationsCheck[0].count > 0 ? documents.length : 0
                    }
                });

            } catch (error) {
                // Rollback transaction on error
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error deleting company:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get company services (public endpoint for UserForm)
    static async getCompanyServices(req, res) {
        try {
            const { companyId } = req.params;

            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            const services = await Company.getCompanyServices(companyId);

            res.status(200).json({
                success: true,
                data: {
                    company_id: companyId,
                    services
                }
            });

        } catch (error) {
            console.error('Error fetching company services:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Check if specific service is enabled (public endpoint for UserForm)
    static async checkServiceEnabled(req, res) {
        try {
            const { companyId, serviceName } = req.params;

            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            const isEnabled = await Company.isServiceEnabled(companyId, serviceName);

            res.status(200).json({
                success: true,
                data: {
                    company_id: companyId,
                    service_name: serviceName,
                    is_enabled: isEnabled
                }
            });

        } catch (error) {
            console.error('Error checking service status:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get company statistics
    static async getCompanyStats(req, res) {
        try {
            const companies = await Company.findAll();
            
            const stats = {
                total_companies: companies.length,
                active_companies: companies.filter(c => c.is_active).length,
                companies_with_services: companies.filter(c => c.enabled_services && c.enabled_services.length > 0).length
            };

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error fetching company statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            const { pool } = require('../config/database');
            
            // Get all statistics in one query
            const [statsResult] = await pool.execute(`
                SELECT 
                    COUNT(DISTINCT c.id) as total_clients,
                    COUNT(DISTINCT a.id) as total_verifications,
                    COUNT(DISTINCT CASE WHEN a.application_status = 'pending' THEN a.id END) as pending_verifications,
                    COUNT(DISTINCT CASE WHEN a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN a.id END) as this_week_verifications,
                    COUNT(DISTINCT CASE WHEN a.application_status = 'approved' THEN a.id END) as approved_verifications,
                    COUNT(DISTINCT CASE WHEN a.application_status = 'rejected' THEN a.id END) as rejected_verifications,
                    (SELECT COUNT(*) FROM users WHERE user_type = 'verifier' AND is_active = TRUE) as total_employees
                FROM companies c
                LEFT JOIN applications a ON c.id = a.company_id
                WHERE c.is_active = TRUE
            `);

            const stats = statsResult[0];

            res.status(200).json({
                success: true,
                data: {
                    clients: parseInt(stats.total_clients) || 0,
                    total_verifications: parseInt(stats.total_verifications) || 0,
                    pending: parseInt(stats.pending_verifications) || 0,
                    this_week: parseInt(stats.this_week_verifications) || 0,
                    total_approved: parseInt(stats.approved_verifications) || 0,
                    total_rejected: parseInt(stats.rejected_verifications) || 0,
                    total_employees: parseInt(stats.total_employees) || 0
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get companies dropdown (for parent company selection and sub-companies assignment)
    static async getCompaniesDropdown(req, res) {
        try {
            const { excludeId, includeCurrentSubs, includeAll } = req.query; // Exclude current company, include current sub-companies, include all companies
            const companies = await Company.findAll();
            
            // If includeAll is true, return all companies (for filters, etc.)
            if (includeAll === 'true') {
                const allCompanies = companies.filter(company => {
                    if (excludeId && company.id === parseInt(excludeId)) {
                        return false; // Exclude current company if provided
                    }
                    return true; // Include all other companies
                });
                
                const dropdownData = allCompanies.map(company => ({
                    id: company.id,
                    label: company.name,
                    value: company.id,
                    name: company.name
                }));

                return res.status(200).json({
                    success: true,
                    data: dropdownData
                });
            }
            
            // Get current sub-companies if includeCurrentSubs is true
            let currentSubCompanyIds = [];
            if (includeCurrentSubs === 'true' && excludeId) {
                const subCompanies = companies.filter(company => 
                    company.parent_company_id === parseInt(excludeId)
                );
                currentSubCompanyIds = subCompanies.map(sc => sc.id);
            }
            
            // Filter companies:
            // 1. Exclude current company if provided
            // 2. Include companies without parents (can be assigned as sub-companies)
            // 3. Include current sub-companies even if they have a parent (so they can be shown as selected)
            const availableCompanies = companies.filter(company => {
                if (excludeId && company.id === parseInt(excludeId)) {
                    return false; // Exclude current company
                }
                // Include if: no parent OR it's already a sub-company of the current company
                return !company.parent_company_id || currentSubCompanyIds.includes(company.id);
            });
            
            // Transform companies to dropdown format
            const dropdownData = availableCompanies.map(company => ({
                id: company.id,
                label: company.name,
                value: company.id,
                name: company.name
            }));

            res.status(200).json({
                success: true,
                data: dropdownData
            });

        } catch (error) {
            console.error('Error fetching companies dropdown:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get company employees with pending cases count
    static async getCompanyEmployees(req, res) {
        try {
            const { pool } = require('../config/database');
            const companyId = req.user.company_id; // Get company ID from authenticated user
            
            console.log('Getting employees for company:', companyId);

            // Get employees assigned to this company with pending cases count
            const [employees] = await pool.execute(`
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.created_at,
                    COUNT(DISTINCT a.id) as pending_cases
                FROM users u
                INNER JOIN verifier_assignments va ON u.id = va.verifier_id
                LEFT JOIN applications a ON va.company_id = a.company_id 
                    AND a.application_status IN ('pending', 'assigned', 'under_review')
                WHERE va.company_id = ? 
                AND va.is_active = TRUE 
                AND u.user_type = 'verifier'
                AND u.is_active = TRUE
                GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at
                ORDER BY u.created_at DESC
            `, [companyId]);

            // Transform data for frontend
            const transformedEmployees = employees.map(employee => ({
                id: employee.id,
                name: `${employee.first_name} ${employee.last_name}`,
                email: employee.email,
                phone: '-', // Phone not available in users table
                pendingCases: parseInt(employee.pending_cases) || 0,
                assignedDate: employee.created_at
            }));

            res.status(200).json({
                success: true,
                data: transformedEmployees
            });

        } catch (error) {
            console.error('Error fetching company employees:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = CompanyController;
