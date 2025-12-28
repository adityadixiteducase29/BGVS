const { pool } = require('../config/database');

class ReviewController {
    /**
     * Submit field and file reviews for an application
     * POST /api/applications/:id/review
     */
    static async submitReview(req, res) {
        const connection = await pool.getConnection();
        
        try {
            const { id } = req.params;
            const { fieldReviews, fileReviews, overallNotes } = req.body;
            const reviewerId = req.user.id;

            console.log('🔍 Review submission for application:', id);
            console.log('👤 Reviewer:', reviewerId);
            console.log('📝 Field reviews:', fieldReviews?.length || 0);
            console.log('📁 File reviews:', fileReviews?.length || 0);

            // Validate application exists and is assigned to this verifier
            const applicationQuery = `
                SELECT a.*, u.first_name, u.last_name, u.email as verifier_email
                FROM applications a
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE a.id = ? AND a.assigned_verifier_id = ?
            `;
            
            const [applications] = await connection.execute(applicationQuery, [id, reviewerId]);
            
            if (applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found or not assigned to you'
                });
            }

            const application = applications[0];

            // Start transaction
            await connection.beginTransaction();

            try {
                // Process field reviews
                if (fieldReviews && Array.isArray(fieldReviews)) {
                    for (const fieldReview of fieldReviews) {
                        const { fieldName, fieldValue, status, notes } = fieldReview;
                        
                        if (!fieldName || !status) {
                            throw new Error(`Invalid field review: fieldName and status are required`);
                        }

                        // Insert or update field review
                        const fieldReviewQuery = `
                            INSERT INTO field_reviews 
                            (application_id, field_name, field_value, review_status, review_notes, reviewed_by)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            field_value = VALUES(field_value),
                            review_status = VALUES(review_status),
                            review_notes = VALUES(review_notes),
                            reviewed_by = VALUES(reviewed_by),
                            reviewed_at = CURRENT_TIMESTAMP
                        `;
                        
                        await connection.execute(fieldReviewQuery, [
                            id, fieldName, fieldValue || null, status, notes || null, reviewerId
                        ]);
                    }
                }

                // Process file reviews
                if (fileReviews && Array.isArray(fileReviews)) {
                    for (const fileReview of fileReviews) {
                        const { fileId, status, notes } = fileReview;
                        
                        if (!fileId || !status) {
                            throw new Error(`Invalid file review: fileId and status are required`);
                        }

                        // Verify file belongs to this application
                        const fileCheckQuery = `
                            SELECT id FROM application_documents 
                            WHERE id = ? AND application_id = ?
                        `;
                        const [fileCheck] = await connection.execute(fileCheckQuery, [fileId, id]);
                        
                        if (fileCheck.length === 0) {
                            throw new Error(`File ${fileId} not found for application ${id}`);
                        }

                        // Insert or update file review
                        const fileReviewQuery = `
                            INSERT INTO file_reviews 
                            (application_id, file_id, review_status, review_notes, reviewed_by)
                            VALUES (?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            review_status = VALUES(review_status),
                            review_notes = VALUES(review_notes),
                            reviewed_by = VALUES(reviewed_by),
                            reviewed_at = CURRENT_TIMESTAMP
                        `;
                        
                        await connection.execute(fileReviewQuery, [
                            id, fileId, status, notes || null, reviewerId
                        ]);
                    }
                }

                // Update application review summary
                const reviewSummaryQuery = `
                    INSERT INTO application_reviews 
                    (application_id, overall_status, review_notes, reviewed_by)
                    VALUES (?, 'under_review', ?, ?)
                    ON DUPLICATE KEY UPDATE
                    review_notes = VALUES(review_notes),
                    reviewed_by = VALUES(reviewed_by),
                    reviewed_at = CURRENT_TIMESTAMP
                `;
                
                await connection.execute(reviewSummaryQuery, [id, overallNotes || null, reviewerId]);

                // Update application status to under_review
                await connection.execute(
                    'UPDATE applications SET application_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    ['under_review', id]
                );

                // Commit transaction
                await connection.commit();

                console.log('✅ Review submitted successfully for application:', id);

                res.json({
                    success: true,
                    message: 'Review submitted successfully',
                    data: {
                        applicationId: id,
                        fieldReviewsCount: fieldReviews?.length || 0,
                        fileReviewsCount: fileReviews?.length || 0,
                        overallStatus: 'under_review'
                    }
                });

            } catch (error) {
                // Rollback transaction
                await connection.rollback();
                throw error;
            }

        } catch (error) {
            console.error('❌ Error submitting review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit review',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }

    /**
     * Get review details for an application
     * GET /api/applications/:id/review
     */
    static async getReview(req, res) {
        try {
            const { id } = req.params;
            const reviewerId = req.user.id;

            console.log('🔍 Getting review for application:', id);

            // Get application data to extract all fields
            const applicationQuery = `
                SELECT * FROM applications WHERE id = ?
            `;
            const [applications] = await pool.execute(applicationQuery, [id]);
            
            if (applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            const application = applications[0];

            // Get existing field reviews
            const fieldReviewsQuery = `
                SELECT fr.*, u.first_name, u.last_name, u.email as reviewer_email
                FROM field_reviews fr
                LEFT JOIN users u ON fr.reviewed_by = u.id
                WHERE fr.application_id = ?
                ORDER BY fr.field_name
            `;
            const [existingFieldReviews] = await pool.execute(fieldReviewsQuery, [id]);

            // Get application files
            const filesQuery = `
                SELECT ad.*, fr.review_status, fr.review_notes, fr.reviewed_by, fr.reviewed_at,
                       u.first_name, u.last_name, u.email as reviewer_email
                FROM application_documents ad
                LEFT JOIN file_reviews fr ON ad.id = fr.file_id
                LEFT JOIN users u ON fr.reviewed_by = u.id
                WHERE ad.application_id = ?
                ORDER BY ad.document_type, ad.document_name
            `;
            const [files] = await pool.execute(filesQuery, [id]);

            // Define all reviewable fields from the application
            const reviewableFields = [
                // Personal Information
                'applicant_first_name', 'applicant_last_name', 'applicant_email', 'applicant_phone', 'applicant_dob',
                'gender', 'languages', 'father_name', 'mother_name', 'emergency_contact_number',
                
                // Address Information
                'current_house_no', 'current_area_locality', 'current_area_locality_2', 'current_district',
                'current_police_station', 'current_pincode', 'current_tehsil', 'current_post_office',
                'current_landmark', 'use_current_as_permanent', 'permanent_house_no', 'permanent_area_locality',
                'permanent_area_locality_2', 'permanent_district', 'permanent_police_station', 'permanent_pincode',
                'permanent_tehsil', 'permanent_post_office', 'permanent_landmark', 'current_address', 'permanent_address',
                
                // Education Information
                'highest_education', 'institute_name', 'education_city', 'grades', 'education_from_date',
                'education_to_date', 'education_address',
                
                // Reference Information
                'reference1_name', 'reference1_address', 'reference1_relation', 'reference1_contact',
                'reference1_police_station', 'reference2_name', 'reference2_address', 'reference2_relation',
                'reference2_contact', 'reference2_police_station', 'reference3_name', 'reference3_address',
                'reference3_relation', 'reference3_contact', 'reference3_police_station', 'reference_address',
                
                // Document Information
                'aadhar_number', 'pan_number',
                
                // Employment Information
                'company_name', 'designation', 'employee_id', 'employment_location', 'employment_from_date',
                'employment_to_date', 'hr_number', 'hr_email', 'work_responsibility', 'salary',
                'reason_of_leaving', 'previous_manager',
                
                // Neighbor Information
                'neighbour1_family_members', 'neighbour1_name', 'neighbour1_mobile', 'neighbour1_since',
                'neighbour1_remark', 'neighbour2_name', 'neighbour2_mobile', 'neighbour2_since', 'neighbour2_remark',
                
                // Residence Information
                'residing_date', 'residing_remark', 'bike_quantity', 'car_quantity', 'ac_quantity', 'place',
                
                // Tenancy Information
                'house_owner_name', 'house_owner_contact', 'house_owner_address', 'residing'
            ];

            // Create field reviews map for quick lookup
            const fieldReviewsMap = new Map();
            existingFieldReviews.forEach(review => {
                fieldReviewsMap.set(review.field_name, review);
            });

            // Build complete field reviews array with defaults
            const fieldReviews = reviewableFields.map(fieldName => {
                const existingReview = fieldReviewsMap.get(fieldName);
                const fieldValue = application[fieldName];
                
                return existingReview || {
                    application_id: parseInt(id),
                    field_name: fieldName,
                    field_value: fieldValue,
                    review_status: 'pending',
                    review_notes: null,
                    reviewed_by: null,
                    reviewed_at: null,
                    reviewer_email: null
                };
            });

            // Get question answers and add their reviews to fieldReviews
            const Question = require('../models/Question');
            try {
                const questionAnswers = await Question.getAnswersByApplication(id);
                questionAnswers.forEach(qa => {
                    const fieldName = `question_answer_${qa.id}`;
                    const existingReview = fieldReviewsMap.get(fieldName);
                    
                    fieldReviews.push(existingReview || {
                        application_id: parseInt(id),
                        field_name: fieldName,
                        field_value: qa.answer_text || '',
                        review_status: 'pending',
                        review_notes: null,
                        reviewed_by: null,
                        reviewed_at: null,
                        reviewer_email: null
                    });
                });
            } catch (error) {
                console.error('Error fetching question answers for review:', error);
                // Don't fail the entire request if question answers can't be fetched
            }

            // Build file reviews array with defaults
            const fileReviews = files.map(file => ({
                application_id: parseInt(id),
                file_id: file.id,
                document_name: file.document_name,
                document_type: file.document_type,
                file_path: file.file_path,
                file_size: file.file_size,
                review_status: file.review_status || 'pending',
                review_notes: file.review_notes || null,
                reviewed_by: file.reviewed_by || null,
                reviewed_at: file.reviewed_at || null,
                reviewer_email: file.reviewer_email || null
            }));

            // Get application review summary
            const summaryQuery = `
                SELECT ar.*, u.first_name, u.last_name, u.email as reviewer_email
                FROM application_reviews ar
                LEFT JOIN users u ON ar.reviewed_by = u.id
                WHERE ar.application_id = ?
            `;
            const [summary] = await pool.execute(summaryQuery, [id]);

            res.json({
                success: true,
                data: {
                    applicationId: id,
                    fieldReviews,
                    fileReviews,
                    summary: summary[0] || null,
                    counts: {
                        totalFields: fieldReviews.length,
                        approvedFields: fieldReviews.filter(f => f.review_status === 'approved').length,
                        rejectedFields: fieldReviews.filter(f => f.review_status === 'rejected').length,
                        pendingFields: fieldReviews.filter(f => f.review_status === 'pending').length,
                        totalFiles: fileReviews.length,
                        approvedFiles: fileReviews.filter(f => f.review_status === 'approved').length,
                        rejectedFiles: fileReviews.filter(f => f.review_status === 'rejected').length,
                        pendingFiles: fileReviews.filter(f => f.review_status === 'pending').length
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error getting review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get review details',
                error: error.message
            });
        }
    }

    /**
     * Finalize application review (approve/reject overall)
     * POST /api/applications/:id/finalize-review
     */
    static async finalizeReview(req, res) {
        const connection = await pool.getConnection();
        
        try {
            const { id } = req.params;
            const { overallStatus, finalNotes, rejectionReason } = req.body;
            const reviewerId = req.user.id;

            console.log('🔍 Finalizing review for application:', id, 'Status:', overallStatus);

            if (!overallStatus || !['approved', 'rejected'].includes(overallStatus)) {
                return res.status(400).json({
                    success: false,
                    message: 'Overall status must be either "approved" or "rejected"'
                });
            }

            // Validate rejection reason is provided when status is rejected
            if (overallStatus === 'rejected' && !rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required when rejecting an application'
                });
            }

            // Validate application exists and is assigned to this verifier
            const applicationQuery = `
                SELECT * FROM applications 
                WHERE id = ? AND assigned_verifier_id = ?
            `;
            
            const [applications] = await connection.execute(applicationQuery, [id, reviewerId]);
            
            if (applications.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found or not assigned to you'
                });
            }

            // Start transaction
            await connection.beginTransaction();

            try {
                // Update application review summary
                const reviewSummaryQuery = `
                    INSERT INTO application_reviews 
                    (application_id, overall_status, review_notes, reviewed_by)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    overall_status = VALUES(overall_status),
                    review_notes = VALUES(review_notes),
                    reviewed_by = VALUES(reviewed_by),
                    reviewed_at = CURRENT_TIMESTAMP
                `;
                
                await connection.execute(reviewSummaryQuery, [id, overallStatus, finalNotes || null, reviewerId]);

                // Update application status and rejection reason if rejected
                if (overallStatus === 'rejected') {
                    await connection.execute(
                        'UPDATE applications SET application_status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [overallStatus, rejectionReason, id]
                    );
                } else {
                    // Clear rejection reason if approving
                    await connection.execute(
                        'UPDATE applications SET application_status = ?, rejection_reason = NULL, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [overallStatus, id]
                    );
                }

                // Commit transaction
                await connection.commit();

                console.log('✅ Review finalized successfully for application:', id, 'Status:', overallStatus);

                res.json({
                    success: true,
                    message: `Application ${overallStatus} successfully`,
                    data: {
                        applicationId: id,
                        overallStatus,
                        finalizedAt: new Date().toISOString()
                    }
                });

            } catch (error) {
                // Rollback transaction
                await connection.rollback();
                throw error;
            }

        } catch (error) {
            console.error('❌ Error finalizing review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to finalize review',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
}

module.exports = ReviewController;