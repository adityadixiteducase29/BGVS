const { pool } = require('../config/database');

class Application {
    constructor(applicationData) {
        // Basic application fields
        this.company_id = applicationData.company_id;
        this.applicant_first_name = applicationData.applicant_first_name;
        this.applicant_last_name = applicationData.applicant_last_name;
        this.applicant_email = applicationData.applicant_email;
        this.applicant_phone = applicationData.applicant_phone;
        this.applicant_dob = applicationData.applicant_dob;
        this.applicant_address = applicationData.applicant_address;
        this.position_applied = applicationData.position_applied;
        this.department = applicationData.department;
        this.application_status = applicationData.application_status || 'pending';
        this.assigned_verifier_id = applicationData.assigned_verifier_id || null;
        this.assigned_at = applicationData.assigned_at || null;
        this.reviewed_at = applicationData.reviewed_at || null;
        this.review_notes = applicationData.review_notes || null;
        this.rejection_reason = applicationData.rejection_reason || null;

        // Personal information fields
        this.gender = applicationData.gender || null;
        this.languages = applicationData.languages || null;
        this.father_name = applicationData.father_name || null;
        this.mother_name = applicationData.mother_name || null;
        this.emergency_contact_number = applicationData.emergency_contact_number || null;

        // Current address fields
        this.current_house_no = applicationData.current_house_no || null;
        this.current_area_locality = applicationData.current_area_locality || null;
        this.current_area_locality_2 = applicationData.current_area_locality_2 || null;
        this.current_district = applicationData.current_district || null;
        this.current_police_station = applicationData.current_police_station || null;
        this.current_pincode = applicationData.current_pincode || null;
        this.current_tehsil = applicationData.current_tehsil || null;
        this.current_post_office = applicationData.current_post_office || null;
        this.current_landmark = applicationData.current_landmark || null;

        // Permanent address fields
        this.use_current_as_permanent = applicationData.use_current_as_permanent === 'true' || applicationData.use_current_as_permanent === true || false;
        this.permanent_house_no = applicationData.permanent_house_no || null;
        this.permanent_area_locality = applicationData.permanent_area_locality || null;
        this.permanent_area_locality_2 = applicationData.permanent_area_locality_2 || null;
        this.permanent_district = applicationData.permanent_district || null;
        this.permanent_police_station = applicationData.permanent_police_station || null;
        this.permanent_pincode = applicationData.permanent_pincode || null;
        this.permanent_tehsil = applicationData.permanent_tehsil || null;
        this.permanent_post_office = applicationData.permanent_post_office || null;
        this.permanent_landmark = applicationData.permanent_landmark || null;

        // Education fields
        this.highest_education = applicationData.highest_education || null;
        this.institute_name = applicationData.institute_name || null;
        this.education_city = applicationData.education_city || null;
        this.grades = applicationData.grades || null;
        this.education_from_date = applicationData.education_from_date || null;
        this.education_to_date = applicationData.education_to_date || null;
        this.education_address = applicationData.education_address || null;

        // Reference fields
        this.reference1_name = applicationData.reference1_name || null;
        this.reference1_address = applicationData.reference1_address || null;
        this.reference1_relation = applicationData.reference1_relation || null;
        this.reference1_contact = applicationData.reference1_contact || null;
        this.reference1_police_station = applicationData.reference1_police_station || null;
        this.reference2_name = applicationData.reference2_name || null;
        this.reference2_address = applicationData.reference2_address || null;
        this.reference2_relation = applicationData.reference2_relation || null;
        this.reference2_contact = applicationData.reference2_contact || null;
        this.reference2_police_station = applicationData.reference2_police_station || null;
        this.reference3_name = applicationData.reference3_name || null;
        this.reference3_address = applicationData.reference3_address || null;
        this.reference3_relation = applicationData.reference3_relation || null;
        this.reference3_contact = applicationData.reference3_contact || null;
        this.reference3_police_station = applicationData.reference3_police_station || null;
        this.reference_address = applicationData.reference_address || null;

        // Identity document fields
        this.aadhar_number = applicationData.aadhar_number || null;
        this.pan_number = applicationData.pan_number || null;

        // Employment fields
        this.company_name = applicationData.company_name || null;
        this.designation = applicationData.designation || null;
        this.employee_id = applicationData.employee_id || null;
        this.employment_location = applicationData.employment_location || null;
        this.employment_from_date = applicationData.employment_from_date || null;
        this.employment_to_date = applicationData.employment_to_date || null;
        this.hr_number = applicationData.hr_number || null;
        this.hr_email = applicationData.hr_email || null;
        this.work_responsibility = applicationData.work_responsibility || null;
        this.salary = applicationData.salary || null;
        this.reason_of_leaving = applicationData.reason_of_leaving || null;
        this.previous_manager = applicationData.previous_manager || null;

        // Neighbor information fields
        this.neighbour1_family_members = applicationData.neighbour1_family_members || null;
        this.neighbour1_name = applicationData.neighbour1_name || null;
        this.neighbour1_mobile = applicationData.neighbour1_mobile || null;
        this.neighbour1_since = applicationData.neighbour1_since || null;
        this.neighbour1_remark = applicationData.neighbour1_remark || null;
        this.neighbour2_name = applicationData.neighbour2_name || null;
        this.neighbour2_mobile = applicationData.neighbour2_mobile || null;
        this.neighbour2_since = applicationData.neighbour2_since || null;
        this.neighbour2_remark = applicationData.neighbour2_remark || null;

        // Residence information fields
        this.residing_date = applicationData.residing_date || null;
        this.residing_remark = applicationData.residing_remark || null;
        this.bike_quantity = parseInt(applicationData.bike_quantity) || 0;
        this.car_quantity = parseInt(applicationData.car_quantity) || 0;
        this.ac_quantity = parseInt(applicationData.ac_quantity) || 0;
        this.place = applicationData.place || null;
        this.house_owner_name = applicationData.house_owner_name || null;
        this.house_owner_contact = applicationData.house_owner_contact || null;
        this.house_owner_address = applicationData.house_owner_address || null;
        this.residing = applicationData.residing || null;

        // Computed address fields
        this.current_address = applicationData.current_address || null;
        this.permanent_address = applicationData.permanent_address || null;
    }

    // Get applicant full name
    get applicantFullName() {
        return `${this.applicant_first_name} ${this.applicant_last_name}`;
    }

    // Save application to database
    async save() {
        try {
            // Validate required fields
            if (!this.applicant_first_name || !this.applicant_last_name || !this.applicant_email) {
                throw new Error('Required fields missing: applicant_first_name, applicant_last_name, and applicant_email are required');
            }

            // Convert undefined values to null for database compatibility
            const params = [
                this.company_id || null,
                this.applicant_first_name,
                this.applicant_last_name,
                this.applicant_email,
                this.applicant_phone || null,
                this.applicant_dob || null,
                this.applicant_address || null,
                this.position_applied || null,
                this.department || null,
                this.application_status || null,
                this.assigned_verifier_id || null,
                this.assigned_at || null,
                this.reviewed_at || null,
                this.review_notes || null,
                this.rejection_reason || null,
                // Personal information fields
                this.gender || null,
                this.languages || null,
                this.father_name || null,
                this.mother_name || null,
                this.emergency_contact_number || null,
                // Current address fields
                this.current_house_no || null,
                this.current_area_locality || null,
                this.current_area_locality_2 || null,
                this.current_district || null,
                this.current_police_station || null,
                this.current_pincode || null,
                this.current_tehsil || null,
                this.current_post_office || null,
                this.current_landmark || null,
                // Permanent address fields
                this.use_current_as_permanent || false,
                this.permanent_house_no || null,
                this.permanent_area_locality || null,
                this.permanent_area_locality_2 || null,
                this.permanent_district || null,
                this.permanent_police_station || null,
                this.permanent_pincode || null,
                this.permanent_tehsil || null,
                this.permanent_post_office || null,
                this.permanent_landmark || null,
                // Education fields
                this.highest_education || null,
                this.institute_name || null,
                this.education_city || null,
                this.grades || null,
                this.education_from_date || null,
                this.education_to_date || null,
                this.education_address || null,
                // Reference fields
                this.reference1_name || null,
                this.reference1_address || null,
                this.reference1_relation || null,
                this.reference1_contact || null,
                this.reference1_police_station || null,
                this.reference2_name || null,
                this.reference2_address || null,
                this.reference2_relation || null,
                this.reference2_contact || null,
                this.reference2_police_station || null,
                this.reference3_name || null,
                this.reference3_address || null,
                this.reference3_relation || null,
                this.reference3_contact || null,
                this.reference3_police_station || null,
                this.reference_address || null,
                // Identity document fields
                this.aadhar_number || null,
                this.pan_number || null,
                // Employment fields
                this.company_name || null,
                this.designation || null,
                this.employee_id || null,
                this.employment_location || null,
                this.employment_from_date || null,
                this.employment_to_date || null,
                this.hr_number || null,
                this.hr_email || null,
                this.work_responsibility || null,
                this.salary || null,
                this.reason_of_leaving || null,
                this.previous_manager || null,
                // Neighbor information fields
                this.neighbour1_family_members || null,
                this.neighbour1_name || null,
                this.neighbour1_mobile || null,
                this.neighbour1_since || null,
                this.neighbour1_remark || null,
                this.neighbour2_name || null,
                this.neighbour2_mobile || null,
                this.neighbour2_since || null,
                this.neighbour2_remark || null,
                // Residence information fields
                this.residing_date || null,
                this.residing_remark || null,
                this.bike_quantity || 0,
                this.car_quantity || 0,
                this.ac_quantity || 0,
                this.place || null,
                this.house_owner_name || null,
                this.house_owner_contact || null,
                this.house_owner_address || null,
                this.residing || null,
                // Computed address fields
                this.current_address || null,
                this.permanent_address || null
            ];

            const [result] = await pool.execute(
                `INSERT INTO applications (
                    company_id, applicant_first_name, applicant_last_name, applicant_email,
                    applicant_phone, applicant_dob, applicant_address, position_applied,
                    department, application_status, assigned_verifier_id, assigned_at,
                    reviewed_at, review_notes, rejection_reason,
                    gender, languages, father_name, mother_name, emergency_contact_number,
                    current_house_no, current_area_locality, current_area_locality_2, current_district,
                    current_police_station, current_pincode, current_tehsil, current_post_office, current_landmark,
                    use_current_as_permanent, permanent_house_no, permanent_area_locality, permanent_area_locality_2,
                    permanent_district, permanent_police_station, permanent_pincode, permanent_tehsil,
                    permanent_post_office, permanent_landmark,
                    highest_education, institute_name, education_city, grades, education_from_date,
                    education_to_date, education_address,
                    reference1_name, reference1_address, reference1_relation, reference1_contact, reference1_police_station,
                    reference2_name, reference2_address, reference2_relation, reference2_contact, reference2_police_station,
                    reference3_name, reference3_address, reference3_relation, reference3_contact, reference3_police_station,
                    reference_address,
                    aadhar_number, pan_number,
                    company_name, designation, employee_id, employment_location, employment_from_date,
                    employment_to_date, hr_number, hr_email, work_responsibility, salary, reason_of_leaving, previous_manager,
                    neighbour1_family_members, neighbour1_name, neighbour1_mobile, neighbour1_since, neighbour1_remark,
                    neighbour2_name, neighbour2_mobile, neighbour2_since, neighbour2_remark,
                    residing_date, residing_remark, bike_quantity, car_quantity, ac_quantity, place,
                    house_owner_name, house_owner_contact, house_owner_address, residing,
                    current_address, permanent_address
                ) VALUES (${'?, '.repeat(params.length - 1)}?)`,
                params
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to create application');
        }
    }

    // Find application by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    a.*,
                    c.name as company_name,
                    c.industry as company_industry,
                    u.first_name as verifier_first_name,
                    u.last_name as verifier_last_name,
                    u.email as verifier_email
                FROM applications a
                LEFT JOIN companies c ON a.company_id = c.id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE a.id = ?
            `, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find application');
        }
    }

    // Get all applications for a company
    static async findByCompany(companyId, status = null) {
        try {
            let query = `
                SELECT 
                    a.*,
                    u.first_name as verifier_first_name,
                    u.last_name as verifier_last_name,
                    u.email as verifier_email
                FROM applications a
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE a.company_id = ?
            `;
            const params = [companyId];

            if (status) {
                query += ' AND a.application_status = ?';
                params.push(status);
            }

            query += ' ORDER BY a.created_at DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch company applications');
        }
    }

    // Get all applications for a company
    static async findByCompany(companyId, status = null) {
        try {
            let query = `
                SELECT 
                    a.*,
                    c.name as company_name,
                    c.industry as company_industry,
                    u.first_name as verifier_first_name,
                    u.last_name as verifier_last_name,
                    u.email as verifier_email
                FROM applications a
                LEFT JOIN companies c ON a.company_id = c.id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE a.company_id = ?
            `;
            const params = [companyId];

            if (status) {
                query += ' AND a.application_status = ?';
                params.push(status);
            }

            query += ' ORDER BY a.created_at DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch company applications');
        }
    }

    // Get applications assigned to a verifier
    static async findByVerifier(verifierId, status = null) {
        try {
            let query = `
                SELECT 
                    a.*,
                    c.name as company_name,
                    c.industry as company_industry
                FROM applications a
                JOIN companies c ON a.company_id = c.id
                WHERE a.assigned_verifier_id = ?
            `;
            const params = [verifierId];

            if (status) {
                query += ' AND a.application_status = ?';
                params.push(status);
            }

            query += ' ORDER BY a.created_at DESC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch verifier applications');
        }
    }

    // Get all applications with filters
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT 
                    a.*,
                    c.name as company_name,
                    c.industry as company_industry,
                    u.first_name as verifier_first_name,
                    u.last_name as verifier_last_name,
                    u.email as verifier_email
                FROM applications a
                LEFT JOIN companies c ON a.company_id = c.id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.status) {
                query += ' AND a.application_status = ?';
                params.push(filters.status);
            }

            if (filters.company_id) {
                query += ' AND a.company_id = ?';
                params.push(filters.company_id);
            }

            if (filters.verifier_id) {
                query += ' AND a.assigned_verifier_id = ?';
                params.push(filters.verifier_id);
            }

            if (filters.search) {
                query += ` AND (
                    a.applicant_first_name LIKE ? OR 
                    a.applicant_last_name LIKE ? OR 
                    a.applicant_email LIKE ? OR
                    c.name LIKE ?
                )`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY a.created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(filters.limit));
            }

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch applications');
        }
    }

    // Assign application to verifier
    async assignToVerifier(verifierId) {
        try {
            const [result] = await pool.execute(
                `UPDATE applications SET 
                    assigned_verifier_id = ?, 
                    assigned_at = CURRENT_TIMESTAMP,
                    application_status = 'assigned',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [verifierId, this.id]
            );

            if (result.affectedRows > 0) {
                this.assigned_verifier_id = verifierId;
                this.assigned_at = new Date();
                this.application_status = 'assigned';
                
                // Log the assignment
                await this.logVerificationAction('assigned', 'Application assigned to verifier');
                
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('Failed to assign application to verifier');
        }
    }

    // Start review process
    async startReview() {
        try {
            const [result] = await pool.execute(
                `UPDATE applications SET 
                    application_status = 'under_review',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [this.id]
            );

            if (result.affectedRows > 0) {
                this.application_status = 'under_review';
                
                // Log the action
                await this.logVerificationAction('started_review', 'Review process started');
                
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('Failed to start review');
        }
    }

    // Approve application
    async approve(reviewNotes = null) {
        try {
            const [result] = await pool.execute(
                `UPDATE applications SET 
                    application_status = 'approved',
                    review_notes = ?,
                    reviewed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [reviewNotes, this.id]
            );

            if (result.affectedRows > 0) {
                this.application_status = 'approved';
                this.review_notes = reviewNotes;
                this.reviewed_at = new Date();
                
                // Log the approval
                await this.logVerificationAction('approved', reviewNotes || 'Application approved');
                
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('Failed to approve application');
        }
    }

    // Reject application
    async reject(rejectionReason) {
        try {
            const [result] = await pool.execute(
                `UPDATE applications SET 
                    application_status = 'rejected',
                    rejection_reason = ?,
                    reviewed_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [rejectionReason, this.id]
            );

            if (result.affectedRows > 0) {
                this.application_status = 'rejected';
                this.rejection_reason = rejectionReason;
                this.reviewed_at = new Date();
                
                // Log the rejection
                await this.logVerificationAction('rejected', rejectionReason);
                
                return true;
            }
            return false;
        } catch (error) {
            throw new Error('Failed to reject application');
        }
    }

    // Log verification action
    async logVerificationAction(action, notes) {
        try {
            await pool.execute(
                `INSERT INTO verification_history (
                    application_id, verifier_id, action, notes
                ) VALUES (?, ?, ?, ?)`,
                [this.id, this.assigned_verifier_id, action, notes]
            );
        } catch (error) {
            console.error('Failed to log verification action:', error);
        }
    }

    // Get application statistics
    static async getStats() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_applications,
                    COUNT(CASE WHEN application_status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN application_status = 'assigned' THEN 1 END) as assigned,
                    COUNT(CASE WHEN application_status = 'under_review' THEN 1 END) as under_review,
                    COUNT(CASE WHEN application_status = 'approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN application_status = 'rejected' THEN 1 END) as rejected
                FROM applications
            `);
            return rows[0] || {};
        } catch (error) {
            throw new Error('Failed to fetch application statistics');
        }
    }

    // Get applications by status for dashboard
    static async getDashboardStats() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    application_status,
                    COUNT(*) as count
                FROM applications 
                GROUP BY application_status
                ORDER BY 
                    CASE application_status
                        WHEN 'pending' THEN 1
                        WHEN 'assigned' THEN 2
                        WHEN 'under_review' THEN 3
                        WHEN 'approved' THEN 4
                        WHEN 'rejected' THEN 5
                    END
            `);
            return rows;
        } catch (error) {
            throw new Error('Failed to fetch dashboard statistics');
        }
    }
}

module.exports = Application;
