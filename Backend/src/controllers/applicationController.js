const Application = require('../models/Application');
const Company = require('../models/Company');
const FileStorageService = require('../services/FileStorageService');

class ApplicationController {
    constructor() {
        this.fileStorageService = new FileStorageService();
    }
    // Create a new application from UserForm
    static async createApplication(req, res) {
        try {
            const { companyId } = req.params;
            let applicationData = req.body;

            // Handle FormData if content-type is multipart/form-data
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                // FormData is already parsed by multer or similar middleware
                // The data should be available in req.body
                applicationData = req.body;
            }

            // Validate company exists
            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Log the received data for debugging
            console.log('Received application data:', applicationData);
            console.log('Files received:', req.files);
            console.log('Required fields check:', {
                applicant_first_name: applicationData.applicant_first_name,
                applicant_last_name: applicationData.applicant_last_name,
                applicant_email: applicationData.applicant_email
            });

            // Prepare application data
            const application = new Application({
                ...applicationData,
                company_id: parseInt(companyId),
                application_status: 'pending'
            });

            // Save application
            const savedApplication = await application.save();
            console.log('Application saved with ID:', savedApplication.id);

            // Process uploaded files if any
            let savedFiles = [];
            if (req.files && req.files.length > 0) {
                try {
                    const fileStorageService = new FileStorageService();
                    savedFiles = await fileStorageService.processFiles(req.files, savedApplication.id);
                    console.log(`Processed ${savedFiles.length} files for application ${savedApplication.id}`);
                } catch (fileError) {
                    console.error('Error processing files:', fileError);
                    // Don't fail the entire request if file processing fails
                    // The application is already saved
                }
            }

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: {
                    id: savedApplication.id,
                    status: savedApplication.application_status,
                    filesProcessed: savedFiles.length,
                    files: savedFiles.map(file => ({
                        fieldName: file.fieldName,
                        originalName: file.originalName,
                        documentType: file.documentType,
                        size: file.size
                    }))
                }
            });

        } catch (error) {
            console.error('Error creating application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get applications for a specific company
    static async getCompanyApplications(req, res) {
        try {
            const { companyId } = req.params;
            const { status } = req.query;

            // Validate company exists
            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Get applications for this company
            const applications = await Application.findByCompany(companyId, status);

            res.status(200).json({
                success: true,
                data: applications
            });

        } catch (error) {
            console.error('Error fetching company applications:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all applications (Admin only)
    static async getAllApplications(req, res) {
        try {
            const { status, client_id, verifier_id, search, limit } = req.query;
            
            const filters = {};
            if (status) filters.status = status;
            if (client_id) filters.client_id = client_id;
            if (verifier_id) filters.verifier_id = verifier_id;
            if (search) filters.search = search;
            if (limit) filters.limit = limit;

            const applications = await Application.findAll(filters);

            res.status(200).json({
                success: true,
                data: applications
            });

        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get application by ID
    static async getApplicationById(req, res) {
        try {
            const { id } = req.params;
            const application = await Application.findById(id);

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Get application files
            let files = [];
            try {
                const fileStorageService = new FileStorageService();
                files = await fileStorageService.getApplicationFiles(id);
            } catch (fileError) {
                console.error('Error fetching application files:', fileError);
                // Don't fail the request if file fetching fails
            }

            res.status(200).json({
                success: true,
                data: {
                    ...application,
                    files: files
                }
            });

        } catch (error) {
            console.error('Error fetching application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Assign application to verifier
    static async assignToVerifier(req, res) {
        try {
            const { id } = req.params;
            const { verifier_id } = req.body;

            // Find application
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Create application instance and assign to verifier
            const appInstance = new Application(application);
            appInstance.id = application.id;
            
            const assigned = await appInstance.assignToVerifier(verifier_id);

            if (!assigned) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to assign application to verifier'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Application assigned to verifier successfully'
            });

        } catch (error) {
            console.error('Error assigning application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Auto-assign application to current verifier
    static async assignToCurrentVerifier(req, res) {
        try {
            const { id } = req.params;
            const verifierId = req.user.id;

            // Find application
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Check if application is already assigned to this verifier
            if (application.assigned_verifier_id === verifierId) {
                return res.status(200).json({
                    success: true,
                    message: 'Application is already assigned to you'
                });
            }

            // Check if application is assigned to another verifier
            if (application.assigned_verifier_id && application.assigned_verifier_id !== verifierId) {
                return res.status(400).json({
                    success: false,
                    message: 'Application is already assigned to another verifier'
                });
            }

            // Create application instance and assign to current verifier
            const appInstance = new Application(application);
            appInstance.id = application.id;
            
            const assigned = await appInstance.assignToVerifier(verifierId);

            if (!assigned) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to assign application to verifier'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Application assigned to you successfully'
            });

        } catch (error) {
            console.error('Error auto-assigning application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Approve application
    static async approveApplication(req, res) {
        try {
            const { id } = req.params;
            const { review_notes } = req.body;

            // Find application
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Create application instance and approve
            const appInstance = new Application(application);
            appInstance.id = application.id;
            
            const approved = await appInstance.approve(review_notes);

            if (!approved) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to approve application'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Application approved successfully'
            });

        } catch (error) {
            console.error('Error approving application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Reject application
    static async rejectApplication(req, res) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;

            if (!rejection_reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            // Find application
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Create application instance and reject
            const appInstance = new Application(application);
            appInstance.id = application.id;
            
            const rejected = await appInstance.reject(rejection_reason);

            if (!rejected) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to reject application'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Application rejected successfully'
            });

        } catch (error) {
            console.error('Error rejecting application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get application statistics
    static async getApplicationStats(req, res) {
        try {
            const stats = await Application.getStats();

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error fetching application stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete application with cascading deletes
    static async deleteApplication(req, res) {
        try {
            const { id } = req.params;
            const { pool } = require('../config/database');

            // Start transaction for data integrity
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // First, check if application exists
                const [applications] = await connection.execute(
                    'SELECT id, applicant_first_name, applicant_last_name FROM applications WHERE id = ?',
                    [id]
                );

                if (applications.length === 0) {
                    await connection.rollback();
                    connection.release();
                    return res.status(404).json({
                        success: false,
                        message: 'Application not found'
                    });
                }

                const application = applications[0];
                console.log(`Deleting application ${id}: ${application.applicant_first_name} ${application.applicant_last_name}`);

                // Get all file paths before deleting for cleanup
                const [documents] = await connection.execute(
                    'SELECT file_path FROM application_documents WHERE application_id = ?',
                    [id]
                );

                // Delete in correct order (child tables first due to foreign key constraints)
                
                // 1. Delete field reviews
                await connection.execute(
                    'DELETE FROM field_reviews WHERE application_id = ?',
                    [id]
                );
                console.log('Deleted field reviews');

                // 2. Delete file reviews
                await connection.execute(
                    'DELETE FROM file_reviews WHERE application_id = ?',
                    [id]
                );
                console.log('Deleted file reviews');

                // 3. Delete application review summary
                await connection.execute(
                    'DELETE FROM application_reviews WHERE application_id = ?',
                    [id]
                );
                console.log('Deleted application review summary');

                // 4. Delete verification history
                await connection.execute(
                    'DELETE FROM verification_history WHERE application_id = ?',
                    [id]
                );
                console.log('Deleted verification history');

                // 5. Delete application documents (this will also delete files from disk)
                await connection.execute(
                    'DELETE FROM application_documents WHERE application_id = ?',
                    [id]
                );
                console.log('Deleted application documents');

                // 6. Finally, delete the application itself
                await connection.execute(
                    'DELETE FROM applications WHERE id = ?',
                    [id]
                );
                console.log('Deleted application');

                // Commit transaction
                await connection.commit();
                connection.release();

                // Clean up files from disk
                const fileStorageService = new FileStorageService();
                for (const doc of documents) {
                    try {
                        await fileStorageService.deleteFileByPath(doc.file_path);
                    } catch (fileError) {
                        console.error(`Error deleting file ${doc.file_path}:`, fileError);
                        // Don't fail the entire operation if file deletion fails
                    }
                }

                res.status(200).json({
                    success: true,
                    message: 'Application deleted successfully',
                    data: {
                        deletedApplicationId: id,
                        deletedFiles: documents.length,
                        applicantName: `${application.applicant_first_name} ${application.applicant_last_name}`
                    }
                });

            } catch (error) {
                // Rollback transaction on error
                await connection.rollback();
                connection.release();
                throw error;
            }

        } catch (error) {
            console.error('Error deleting application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = ApplicationController;
