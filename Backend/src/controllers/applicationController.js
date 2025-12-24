const Application = require('../models/Application');
const Company = require('../models/Company');
const Question = require('../models/Question');
const FileStorageService = require('../services/FileStorageService');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

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

            // Process question answers if any
            let savedAnswers = 0;
            if (applicationData.question_answers) {
                try {
                    // Parse question_answers if it's a string (from FormData)
                    let questionAnswers = applicationData.question_answers;
                    if (typeof questionAnswers === 'string') {
                        questionAnswers = JSON.parse(questionAnswers);
                    }

                    if (Array.isArray(questionAnswers)) {
                        for (const qa of questionAnswers) {
                            if (qa.question_id && qa.answer_text !== undefined) {
                                await Question.saveAnswer(savedApplication.id, qa.question_id, qa.answer_text || '');
                                savedAnswers++;
                            }
                        }
                        console.log(`Processed ${savedAnswers} question answers for application ${savedApplication.id}`);
                    }
                } catch (answerError) {
                    console.error('Error processing question answers:', answerError);
                    // Don't fail the entire request if answer processing fails
                }
            }

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: {
                    id: savedApplication.id,
                    status: savedApplication.application_status,
                    filesProcessed: savedFiles.length,
                    answersProcessed: savedAnswers,
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

    // Get all applications (Admin only) with pagination
    static async getAllApplications(req, res) {
        try {
            const { status, client_id, company_id, verifier_id, search, page, limit } = req.query;
            
            const filters = {};
            if (status) filters.status = status;
            // Support both client_id (legacy) and company_id
            if (company_id) {
                filters.company_id = company_id;
            } else if (client_id) {
                filters.company_id = client_id; // Map client_id to company_id
            }
            if (verifier_id) filters.verifier_id = verifier_id;
            if (search) filters.search = search;
            if (page) filters.page = page;
            filters.limit = limit || 10; // Default to 10 per page

            const result = await Application.findAll(filters);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
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

            // Get question answers
            let questionAnswers = [];
            try {
                questionAnswers = await Question.getAnswersByApplication(id);
            } catch (answerError) {
                console.error('Error fetching question answers:', answerError);
                // Don't fail the request if answer fetching fails
            }

            res.status(200).json({
                success: true,
                data: {
                    ...application,
                    files: files,
                    question_answers: questionAnswers
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
        // Get basic applicant details (name, email, phone, address)
        static async getApplicationBasicDetails(req, res) {
            try {
                const { id } = req.params;
                const application = await Application.findById(id);
    
                if (!application) {
                    return res.status(404).json({
                        success: false,
                        message: 'Application not found'
                    });
                }
    
                // Extract only basic details
                const basicDetails = {
                    id: application.id,
                    applicant_first_name: application.applicant_first_name || '',
                    applicant_last_name: application.applicant_last_name || '',
                    applicant_email: application.applicant_email || '',
                    applicant_phone: application.applicant_phone || '',
                    applicant_address: application.applicant_address || '',
                    // Also include current address if available
                    current_address: application.current_address || '',
                    // Full name for convenience
                    full_name: `${application.applicant_first_name || ''} ${application.applicant_last_name || ''}`.trim()
                };
    
                res.status(200).json({
                    success: true,
                    data: basicDetails
                });
    
            } catch (error) {
                console.error('Error fetching application basic details:', error);
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

    // Update application
    static async updateApplication(req, res) {
        try {
            const { id } = req.params;
            let applicationData = req.body;

            // Handle FormData if content-type is multipart/form-data
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                applicationData = req.body;
            }

            // Find application
            const application = await Application.findById(id);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Create application instance
            const appInstance = new Application(application);
            appInstance.id = application.id;

            // Prepare update data (exclude files and id)
            const updateData = { ...applicationData };
            delete updateData.id;
            delete updateData.company_id; // Don't allow changing company
            delete updateData.application_status; // Don't allow changing status via update
            delete updateData.assigned_verifier_id; // Don't allow changing verifier via update
            delete updateData.created_at;
            delete updateData.updated_at;

            // Update application
            const updated = await appInstance.update(updateData);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update application'
                });
            }

            // Process uploaded files if any
            let savedFiles = [];
            if (req.files && req.files.length > 0) {
                try {
                    const fileStorageService = new FileStorageService();
                    savedFiles = await fileStorageService.processFiles(req.files, id);
                    console.log(`Processed ${savedFiles.length} new files for application ${id}`);
                } catch (fileError) {
                    console.error('Error processing files:', fileError);
                    // Don't fail the entire request if file processing fails
                }
            }

            // Get updated application
            const updatedApplication = await Application.findById(id);

            res.status(200).json({
                success: true,
                message: 'Application updated successfully',
                data: {
                    ...updatedApplication,
                    filesProcessed: savedFiles.length,
                    newFiles: savedFiles.map(file => ({
                        fieldName: file.fieldName,
                        originalName: file.originalName,
                        documentType: file.documentType,
                        size: file.size
                    }))
                }
            });

        } catch (error) {
            console.error('Error updating application:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete a specific document
    static async deleteDocument(req, res) {
        try {
            const { documentId } = req.params;
            
            // Validate documentId
            if (!documentId || isNaN(parseInt(documentId))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document ID'
                });
            }

            const fileStorageService = new FileStorageService();

            const deleted = await fileStorageService.deleteFile(parseInt(documentId));

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: 'Document deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete document'
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

    // Generate CSV template for bulk import
    static async generateCSVTemplate(req, res) {
        try {
            const { companyId } = req.params;

            // Validate company exists
            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            // Define CSV headers with descriptions
            const csvHeaders = [
                // Basic Information (Required)
                'applicant_first_name*', 'applicant_last_name*', 'applicant_email*', 'applicant_phone',
                'applicant_dob', 'applicant_address', 'position_applied', 'department',
                
                // Personal Information
                'gender', 'languages', 'father_name', 'mother_name', 'emergency_contact_number',
                
                // Current Address
                'current_house_no', 'current_area_locality', 'current_area_locality_2', 'current_district',
                'current_police_station', 'current_pincode', 'current_tehsil', 'current_post_office', 'current_landmark',
                
                // Permanent Address
                'use_current_as_permanent', 'permanent_house_no', 'permanent_area_locality', 'permanent_area_locality_2',
                'permanent_district', 'permanent_police_station', 'permanent_pincode', 'permanent_tehsil',
                'permanent_post_office', 'permanent_landmark',
                
                // Education
                'highest_education', 'institute_name', 'education_city', 'grades',
                'education_from_date', 'education_to_date', 'education_address',
                
                // References
                'reference1_name', 'reference1_address', 'reference1_relation', 'reference1_contact', 'reference1_police_station',
                'reference2_name', 'reference2_address', 'reference2_relation', 'reference2_contact', 'reference2_police_station',
                'reference3_name', 'reference3_address', 'reference3_relation', 'reference3_contact', 'reference3_police_station',
                
                // Identity Documents
                'aadhar_number', 'pan_number',
                
                // Employment
                'company_name', 'designation', 'employee_id', 'employment_location',
                'employment_from_date', 'employment_to_date', 'hr_number', 'hr_email',
                'work_responsibility', 'salary', 'reason_of_leaving', 'previous_manager',
                
                // Neighbor Information
                'neighbour1_family_members', 'neighbour1_name', 'neighbour1_mobile', 'neighbour1_since', 'neighbour1_remark',
                'neighbour2_name', 'neighbour2_mobile', 'neighbour2_since', 'neighbour2_remark',
                
                // Residence Information
                'residing_date', 'residing_remark', 'bike_quantity', 'car_quantity', 'ac_quantity', 'place',
                'house_owner_name', 'house_owner_contact', 'house_owner_address', 'residing'
            ];

            // Create sample data row
            const sampleRow = [
                'John', 'Doe', 'john.doe@example.com', '+91-9876543210', '1990-01-15', '123 Main Street, Delhi',
                'Software Engineer', 'IT', 'Male', 'English, Hindi', 'Robert Doe', 'Jane Doe', '+91-9876543211',
                '123', 'Sample Area', 'Near Market', 'Delhi', 'Central Police Station', '110001', 'Central', 'GPO', 'Near Metro',
                'true', '', '', '', '', '', '', '', '', '',
                'Bachelor of Technology', 'IIT Delhi', 'Delhi', '8.5 CGPA', '2010-07-01', '2014-06-30', 'IIT Delhi Campus',
                'Alice Smith', '123 Reference St', 'Friend', '+91-9876543212', 'Central Police Station',
                'Bob Johnson', '456 Reference Ave', 'Colleague', '+91-9876543213', 'Central Police Station',
                'Charlie Brown', '789 Reference Rd', 'Neighbor', '+91-9876543214', 'Central Police Station',
                '123456789012', 'ABCDE1234F',
                'Tech Corp', 'Senior Developer', 'EMP001', 'Delhi', '2020-01-01', '2023-12-31',
                '+91-9876543215', 'hr@techcorp.com', 'Software Development', '800000', 'Career Growth', 'Manager Name',
                '4', 'Neighbor One', '+91-9876543216', '2020-01-01', 'Good neighbor',
                'Neighbor Two', '+91-9876543217', '2020-01-01', 'Helpful neighbor',
                '2020-01-01', 'Living here since 2020', '1', '1', '2', 'Delhi', 'Landlord Name', '+91-9876543218', 'Landlord Address', 'Rented'
            ];

            // Create CSV content
            let csvContent = csvHeaders.join(',') + '\n';
            csvContent += sampleRow.join(',') + '\n';

            // Set response headers for file download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="application_template_${company.name.replace(/\s+/g, '_')}.csv"`);
            
            res.send(csvContent);

        } catch (error) {
            console.error('Error generating CSV template:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate CSV template',
                error: error.message
            });
        }
    }

    // Import applications from CSV
    static async importFromCSV(req, res) {
        try {
            const { companyId } = req.params;

            // Validate company exists
            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No CSV file uploaded'
                });
            }

            const results = {
                total: 0,
                successful: 0,
                failed: 0,
                errors: [],
                successfulApplications: [],
                failedApplications: []
            };

            // Parse CSV file from buffer (memory storage)
            const applications = [];
            await new Promise((resolve, reject) => {
                const { Readable } = require('stream');
                
                // Create a readable stream from the buffer
                const bufferStream = new Readable();
                bufferStream.push(req.file.buffer);
                bufferStream.push(null);
                
                bufferStream
                    .pipe(csv())
                    .on('data', (row) => {
                        // Clean row keys to remove asterisks from headers
                        const cleanedRow = {};
                        Object.keys(row).forEach(key => {
                            cleanedRow[key.replace(/\*/g, '')] = row[key];
                        });
                        applications.push(cleanedRow);
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            results.total = applications.length;

                // Process each application
                for (let i = 0; i < applications.length; i++) {
                    const row = applications[i];
                    const rowNumber = i + 2; // +2 because CSV is 1-indexed and we skip header

                    try {
                        // Debug log for problematic data
                        if (row.applicant_first_name === 'John' && row.applicant_last_name === 'Doe') {
                            console.log('Debug John Doe row:', {
                                grades: row.grades,
                                education_from_date: row.education_from_date,
                                education_to_date: row.education_to_date
                            });
                        }
                    // Validate required fields
                    if (!row.applicant_first_name || !row.applicant_last_name || !row.applicant_email) {
                        throw new Error(`Missing required fields: ${!row.applicant_first_name ? 'applicant_first_name ' : ''}${!row.applicant_last_name ? 'applicant_last_name ' : ''}${!row.applicant_email ? 'applicant_email' : ''}`);
                    }

                    // Validate email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(row.applicant_email.trim())) {
                        throw new Error(`Invalid email format: ${row.applicant_email}`);
                    }

                    // Helper function to convert date format DD/MM/YYYY to YYYY-MM-DD
                    const convertDate = (dateString) => {
                        if (!dateString) return null;
                        const trimmed = dateString.toString().trim();
                        
                        // Skip if it looks like a grade or other non-date value
                        if (trimmed.match(/[A-Za-z]/) && !trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                            return null;
                        }
                        
                        // Check if it's in DD/MM/YYYY format
                        if (trimmed.includes('/')) {
                            const parts = trimmed.split('/');
                            if (parts.length === 3 && parts.every(part => !isNaN(part))) {
                                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                        }
                        
                        // Check if it's already in YYYY-MM-DD format
                        if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            return trimmed;
                        }
                        
                        return null;
                    };

                    // Helper function to validate and clean pincode
                    const cleanPincode = (pincode) => {
                        if (!pincode) return null;
                        const cleaned = pincode.toString().trim().replace(/\D/g, ''); // Remove non-digits
                        return cleaned.length <= 10 ? cleaned : cleaned.substring(0, 10);
                    };

                    // Helper function to clean Aadhar number (12 digits)
                    const cleanAadhar = (aadhar) => {
                        if (!aadhar) return null;
                        const cleaned = aadhar.toString().trim().replace(/\D/g, ''); // Remove non-digits
                        return cleaned.length <= 12 ? cleaned : cleaned.substring(0, 12);
                    };

                    // Helper function to clean PAN number (10 characters)
                    const cleanPAN = (pan) => {
                        if (!pan) return null;
                        const cleaned = pan.toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                        return cleaned.length <= 10 ? cleaned : cleaned.substring(0, 10);
                    };

                    // Check for duplicate email
                    const existingApplication = await Application.findByEmail(row.applicant_email, companyId);
                    if (existingApplication) {
                        throw new Error(`Duplicate email: ${row.applicant_email} already exists`);
                    }

                    // Clean phone number (handle scientific notation)
                    let cleanPhone = null;
                    if (row.applicant_phone) {
                        const phoneStr = row.applicant_phone.toString();
                        // Check if it's scientific notation
                        if (phoneStr.includes('E+') || phoneStr.includes('e+')) {
                            // Convert scientific notation to regular number
                            const num = parseFloat(phoneStr);
                            if (!isNaN(num) && num > 0) {
                                cleanPhone = `+91-${Math.floor(num).toString()}`;
                            }
                        } else {
                            cleanPhone = phoneStr.trim();
                        }
                    }

                    // Clean and prepare data
                    const applicationData = {
                        company_id: parseInt(companyId),
                        applicant_first_name: row.applicant_first_name.trim(),
                        applicant_last_name: row.applicant_last_name.trim(),
                        applicant_email: row.applicant_email.trim().toLowerCase(),
                        applicant_phone: cleanPhone,
                        applicant_dob: convertDate(row.applicant_dob),
                        applicant_address: row.applicant_address ? row.applicant_address.trim() : null,
                        position_applied: row.position_applied ? row.position_applied.trim() : null,
                        department: row.department ? row.department.trim() : null,
                        application_status: 'pending',
                        
                        // Personal information
                        gender: row.gender ? row.gender.trim() : null,
                        languages: row.languages ? row.languages.trim() : null,
                        father_name: row.father_name ? row.father_name.trim() : null,
                        mother_name: row.mother_name ? row.mother_name.trim() : null,
                        emergency_contact_number: row.emergency_contact_number ? row.emergency_contact_number.trim() : null,
                        
                        // Current address
                        current_house_no: row.current_house_no ? row.current_house_no.trim() : null,
                        current_area_locality: row.current_area_locality ? row.current_area_locality.trim() : null,
                        current_area_locality_2: row.current_area_locality_2 ? row.current_area_locality_2.trim() : null,
                        current_district: row.current_district ? row.current_district.trim() : null,
                        current_police_station: row.current_police_station ? row.current_police_station.trim() : null,
                        current_pincode: cleanPincode(row.current_pincode),
                        current_tehsil: row.current_tehsil ? row.current_tehsil.trim() : null,
                        current_post_office: row.current_post_office ? row.current_post_office.trim() : null,
                        current_landmark: row.current_landmark ? row.current_landmark.trim() : null,
                        
                        // Permanent address
                        use_current_as_permanent: row.use_current_as_permanent === 'true' || row.use_current_as_permanent === true,
                        permanent_house_no: row.permanent_house_no ? row.permanent_house_no.trim() : null,
                        permanent_area_locality: row.permanent_area_locality ? row.permanent_area_locality.trim() : null,
                        permanent_area_locality_2: row.permanent_area_locality_2 ? row.permanent_area_locality_2.trim() : null,
                        permanent_district: row.permanent_district ? row.permanent_district.trim() : null,
                        permanent_police_station: row.permanent_police_station ? row.permanent_police_station.trim() : null,
                        permanent_pincode: cleanPincode(row.permanent_pincode),
                        permanent_tehsil: row.permanent_tehsil ? row.permanent_tehsil.trim() : null,
                        permanent_post_office: row.permanent_post_office ? row.permanent_post_office.trim() : null,
                        permanent_landmark: row.permanent_landmark ? row.permanent_landmark.trim() : null,
                        
                        // Education
                        highest_education: row.highest_education ? row.highest_education.trim() : null,
                        institute_name: row.institute_name ? row.institute_name.trim() : null,
                        education_city: row.education_city ? row.education_city.trim() : null,
                        grades: row.grades ? row.grades.trim() : null,
                        education_from_date: convertDate(row.education_from_date),
                        education_to_date: convertDate(row.education_to_date),
                        education_address: row.education_address ? row.education_address.trim() : null,
                        
                        // References
                        reference1_name: row.reference1_name ? row.reference1_name.trim() : null,
                        reference1_address: row.reference1_address ? row.reference1_address.trim() : null,
                        reference1_relation: row.reference1_relation ? row.reference1_relation.trim() : null,
                        reference1_contact: row.reference1_contact ? row.reference1_contact.trim() : null,
                        reference1_police_station: row.reference1_police_station ? row.reference1_police_station.trim() : null,
                        reference2_name: row.reference2_name ? row.reference2_name.trim() : null,
                        reference2_address: row.reference2_address ? row.reference2_address.trim() : null,
                        reference2_relation: row.reference2_relation ? row.reference2_relation.trim() : null,
                        reference2_contact: row.reference2_contact ? row.reference2_contact.trim() : null,
                        reference2_police_station: row.reference2_police_station ? row.reference2_police_station.trim() : null,
                        reference3_name: row.reference3_name ? row.reference3_name.trim() : null,
                        reference3_address: row.reference3_address ? row.reference3_address.trim() : null,
                        reference3_relation: row.reference3_relation ? row.reference3_relation.trim() : null,
                        reference3_contact: row.reference3_contact ? row.reference3_contact.trim() : null,
                        reference3_police_station: row.reference3_police_station ? row.reference3_police_station.trim() : null,
                        
                        // Identity documents
                        aadhar_number: cleanAadhar(row.aadhar_number),
                        pan_number: cleanPAN(row.pan_number),
                        
                        // Employment
                        company_name: row.company_name ? row.company_name.trim() : null,
                        designation: row.designation ? row.designation.trim() : null,
                        employee_id: row.employee_id ? row.employee_id.trim() : null,
                        employment_location: row.employment_location ? row.employment_location.trim() : null,
                        employment_from_date: convertDate(row.employment_from_date),
                        employment_to_date: convertDate(row.employment_to_date),
                        hr_number: row.hr_number ? row.hr_number.trim() : null,
                        hr_email: row.hr_email ? row.hr_email.trim() : null,
                        work_responsibility: row.work_responsibility ? row.work_responsibility.trim() : null,
                        salary: row.salary ? row.salary.trim() : null,
                        reason_of_leaving: row.reason_of_leaving ? row.reason_of_leaving.trim() : null,
                        previous_manager: row.previous_manager ? row.previous_manager.trim() : null,
                        
                        // Neighbor information
                        neighbour1_family_members: row.neighbour1_family_members ? row.neighbour1_family_members.trim() : null,
                        neighbour1_name: row.neighbour1_name ? row.neighbour1_name.trim() : null,
                        neighbour1_mobile: row.neighbour1_mobile ? row.neighbour1_mobile.trim() : null,
                        neighbour1_since: convertDate(row.neighbour1_since),
                        neighbour1_remark: row.neighbour1_remark ? row.neighbour1_remark.trim() : null,
                        neighbour2_name: row.neighbour2_name ? row.neighbour2_name.trim() : null,
                        neighbour2_mobile: row.neighbour2_mobile ? row.neighbour2_mobile.trim() : null,
                        neighbour2_since: convertDate(row.neighbour2_since),
                        neighbour2_remark: row.neighbour2_remark ? row.neighbour2_remark.trim() : null,
                        
                        // Residence information
                        residing_date: convertDate(row.residing_date),
                        residing_remark: row.residing_remark ? row.residing_remark.trim() : null,
                        bike_quantity: row.bike_quantity ? parseInt(row.bike_quantity) || 0 : 0,
                        car_quantity: row.car_quantity ? parseInt(row.car_quantity) || 0 : 0,
                        ac_quantity: row.ac_quantity ? parseInt(row.ac_quantity) || 0 : 0,
                        place: row.place ? row.place.trim() : null,
                        house_owner_name: row.house_owner_name ? row.house_owner_name.trim() : null,
                        house_owner_contact: row.house_owner_contact ? row.house_owner_contact.trim() : null,
                        house_owner_address: row.house_owner_address ? row.house_owner_address.trim() : null,
                        residing: row.residing ? row.residing.trim() : null
                    };

                    // Create and save application
                    const application = new Application(applicationData);
                    const savedApplication = await application.save();

                    results.successful++;
                    results.successfulApplications.push({
                        row: rowNumber,
                        applicationId: savedApplication.id,
                        applicantName: `${savedApplication.applicant_first_name} ${savedApplication.applicant_last_name}`,
                        email: savedApplication.applicant_email
                    });

                    } catch (error) {
                        results.failed++;
                        
                        // Enhanced error message for various issues
                        let enhancedError = error.message;
                        if (error.message.includes('Incorrect date value')) {
                            const fieldMatch = error.message.match(/column '([^']+)'/);
                            if (fieldMatch) {
                                const fieldName = fieldMatch[1];
                                enhancedError = `Invalid date format in ${fieldName} column. Expected DD/MM/YYYY or YYYY-MM-DD format.`;
                            }
                        } else if (error.message.includes('Data too long for column')) {
                            const fieldMatch = error.message.match(/column '([^']+)'/);
                            if (fieldMatch) {
                                const fieldName = fieldMatch[1];
                                enhancedError = `Data too long for ${fieldName} column. Please check your CSV data alignment.`;
                            }
                        }
                        
                        results.errors.push({
                            row: rowNumber,
                            error: enhancedError,
                            data: {
                                applicant_first_name: row.applicant_first_name,
                                applicant_last_name: row.applicant_last_name,
                                applicant_email: row.applicant_email
                            }
                        });
                        results.failedApplications.push({
                            row: rowNumber,
                            applicantName: `${row.applicant_first_name || ''} ${row.applicant_last_name || ''}`.trim(),
                            email: row.applicant_email || 'N/A',
                            error: enhancedError
                        });
                    }
            }

            // Note: No file cleanup needed with memory storage
            // File is automatically garbage collected after request completes

            // Return results
            res.status(200).json({
                success: true,
                message: `CSV import completed. ${results.successful} successful, ${results.failed} failed out of ${results.total} total rows.`,
                data: results
            });

        } catch (error) {
            console.error('Error importing CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to import CSV',
                error: error.message
            });
        }
    }

    // Export applications to Excel
    static async exportToExcel(req, res) {
        try {
            const { status, client_id, verifier_id, search } = req.query;
            
            const filters = {};
            if (status) filters.status = status;
            if (client_id) filters.client_id = client_id;
            if (verifier_id) filters.verifier_id = verifier_id;
            if (search) filters.search = search;

            const applications = await Application.findAll(filters);

            if (!applications || applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No applications found to export'
                });
            }

            // Prepare data for Excel
            const excelData = applications.map(app => ({
                'Application ID': app.id,
                'First Name': app.applicant_first_name || '',
                'Last Name': app.applicant_last_name || '',
                'Email': app.applicant_email || '',
                'Phone': app.applicant_phone || '',
                'Date of Birth': app.applicant_dob || '',
                'Address': app.applicant_address || '',
                'Company': app.company_name || '',
                'Status': app.application_status || '',
                'Position Applied': app.position_applied || '',
                'Department': app.department || '',
                'Created At': app.created_at ? new Date(app.created_at).toLocaleString() : '',
                'Assigned Verifier': app.assigned_verifier_name || 'Not Assigned',
                'Reviewed At': app.reviewed_at ? new Date(app.reviewed_at).toLocaleString() : '',
                'Review Notes': app.review_notes || '',
                'Rejection Reason': app.rejection_reason || ''
            }));

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const columnWidths = [
                { wch: 12 }, // Application ID
                { wch: 15 }, // First Name
                { wch: 15 }, // Last Name
                { wch: 25 }, // Email
                { wch: 15 }, // Phone
                { wch: 12 }, // Date of Birth
                { wch: 30 }, // Address
                { wch: 20 }, // Company
                { wch: 12 }, // Status
                { wch: 20 }, // Position Applied
                { wch: 15 }, // Department
                { wch: 20 }, // Created At
                { wch: 20 }, // Assigned Verifier
                { wch: 20 }, // Reviewed At
                { wch: 30 }, // Review Notes
                { wch: 30 }  // Rejection Reason
            ];
            worksheet['!cols'] = columnWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

            // Generate Excel file buffer
            const excelBuffer = XLSX.write(workbook, { 
                type: 'buffer', 
                bookType: 'xlsx' 
            });

            // Set response headers
            const filename = `applications_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', excelBuffer.length);

            // Send the file
            res.send(excelBuffer);

        } catch (error) {
            console.error('Error exporting applications to Excel:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export applications to Excel',
                error: error.message
            });
        }
    }
}

module.exports = ApplicationController;
