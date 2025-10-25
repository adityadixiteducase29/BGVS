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
            const companies = await Company.findAll();

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
                    COUNT(DISTINCT CASE WHEN a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN a.id END) as this_week_verifications
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
                    this_week: parseInt(stats.this_week_verifications) || 0
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

    // Get companies dropdown
    static async getCompaniesDropdown(req, res) {
        try {
            const companies = await Company.findAll();
            
            // Transform companies to dropdown format
            const dropdownData = companies.map(company => ({
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
