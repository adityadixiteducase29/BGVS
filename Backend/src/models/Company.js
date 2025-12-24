const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class Company {
    constructor(companyData) {
        this.id = companyData.id;
        this.name = companyData.name;
        this.email = companyData.email;
        this.password = companyData.password;
        this.industry = companyData.industry;
        this.address = companyData.address;
        this.contact_person = companyData.contact_person;
        this.contact_phone = companyData.contact_phone;
        this.verification_form_link = companyData.verification_form_link;
        this.is_active = companyData.is_active !== undefined ? companyData.is_active : true;
        this.created_by = companyData.created_by;
        this.parent_company_id = companyData.parent_company_id || null;
    }

    // Save company to database
    async save() {
        try {
            // Hash password if provided
            let hashedPassword = this.password;
            if (this.password && !this.password.startsWith('$2a$')) {
                hashedPassword = await bcrypt.hash(this.password, 12);
            }

            // Check if parent_company_id column exists
            const hasParentColumn = await Company.hasParentCompanyColumn();
            
            // If parent_company_id is provided but column doesn't exist, throw helpful error
            if (this.parent_company_id && !hasParentColumn) {
                throw new Error('Database migration required: Please run migration_add_parent_company.sql to add parent_company_id column before assigning parent companies.');
            }

            // Convert undefined values to null for database compatibility
            const baseParams = [
                this.name || null,
                this.email || null,
                hashedPassword || null,
                this.industry || null,
                this.address || null,
                this.contact_person || null,
                this.contact_phone || null,
                this.verification_form_link || null,
                this.is_active || null,
                this.created_by || null
            ];

            let insertColumns = `name, email, password, industry, address, contact_person, 
                    contact_phone, verification_form_link, is_active, created_by`;
            let placeholders = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
            let params = baseParams;

            if (hasParentColumn) {
                insertColumns += ', parent_company_id';
                placeholders += ', ?';
                params = [...baseParams, this.parent_company_id || null];
            }

            const [result] = await pool.execute(
                `INSERT INTO companies (${insertColumns}) VALUES (${placeholders})`,
                params
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving company:', error);
            if (error.message && error.message.includes('parent_company_id')) {
                throw error; // Re-throw the helpful error message
            }
            throw new Error(`Failed to create company: ${error.message}`);
        }
    }

    // Find company by ID
    static async findById(id) {
        try {
            const hasParentColumn = await this.hasParentCompanyColumn();
            
            if (hasParentColumn) {
                const [rows] = await pool.execute(`
                    SELECT c.*, parent.name as parent_company_name
                    FROM companies c
                    LEFT JOIN companies parent ON c.parent_company_id = parent.id
                    WHERE c.id = ? AND c.is_active = TRUE
                `, [id]);
                return rows[0] || null;
            } else {
                const [rows] = await pool.execute(`
                    SELECT c.*, NULL as parent_company_name
                    FROM companies c
                    WHERE c.id = ? AND c.is_active = TRUE
                `, [id]);
                const row = rows[0];
                if (row) {
                    row.parent_company_id = null;
                }
                return row || null;
            }
        } catch (error) {
            console.error('Error in Company.findById:', error);
            throw new Error(`Failed to find company: ${error.message}`);
        }
    }

    // Find company by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM companies WHERE email = ? AND is_active = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find company');
        }
    }

    // Check if parent_company_id column exists
    static async hasParentCompanyColumn() {
        try {
            const [rows] = await pool.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'companies' 
                AND COLUMN_NAME = 'parent_company_id'
            `);
            return rows[0].count > 0;
        } catch (error) {
            return false;
        }
    }

    // Get all companies
    static async findAll(companyId = null) {
        try {
            const hasParentColumn = await this.hasParentCompanyColumn();
            
            // If companyId is provided, include sub-companies (only if parent column exists)
            let whereClause = 'c.is_active = TRUE';
            let queryParams = [];
            
            if (companyId) {
                if (hasParentColumn) {
                    // Include the company itself and all its sub-companies
                    whereClause = `(c.id = ? OR c.parent_company_id = ?) AND c.is_active = TRUE`;
                    queryParams = [companyId, companyId];
                } else {
                    // If parent column doesn't exist, just filter by company ID
                    whereClause = 'c.id = ? AND c.is_active = TRUE';
                    queryParams = [companyId];
                }
            }
            
            // Build SELECT clause based on whether parent_company_id exists
            const parentColumnSelect = hasParentColumn 
                ? 'c.parent_company_id, parent.name as parent_company_name,' 
                : 'NULL as parent_company_id, NULL as parent_company_name,';
            
            const parentJoin = hasParentColumn 
                ? 'LEFT JOIN companies parent ON c.parent_company_id = parent.id'
                : '';
            
            const parentGroupBy = hasParentColumn 
                ? 'c.parent_company_id, parent.name,'
                : '';
            
            const [rows] = await pool.execute(`
                SELECT DISTINCT
                    c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                    c.contact_phone, c.verification_form_link, c.is_active, c.created_by, 
                    ${parentColumnSelect}
                    c.created_at, c.updated_at,
                    GROUP_CONCAT(
                        CASE WHEN cs.is_enabled = 1 THEN cs.service_name END
                        SEPARATOR ','
                    ) as enabled_services,
                    COALESCE(pending_apps.pending_count, 0) as pending_count
                FROM companies c
                ${parentJoin}
                LEFT JOIN company_services cs ON c.id = cs.company_id
                LEFT JOIN (
                    SELECT 
                        company_id,
                        COUNT(*) as pending_count
                    FROM applications 
                    WHERE application_status = 'pending'
                    GROUP BY company_id
                ) pending_apps ON c.id = pending_apps.company_id
                WHERE ${whereClause}
                GROUP BY c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                         c.contact_phone, c.verification_form_link, c.created_by, 
                         ${parentGroupBy}
                         c.created_at, c.updated_at, pending_apps.pending_count
                ORDER BY c.created_at DESC
            `, queryParams);
            
            return rows.map(row => ({
                ...row,
                enabled_services: row.enabled_services ? row.enabled_services.split(',').filter(Boolean) : [],
                pending_count: parseInt(row.pending_count) || 0,
                company_link: `${config.frontendUrl}/user-form/${row.id}`,
                parent_company_id: row.parent_company_id || null
            }));
        } catch (error) {
            console.error('Error in Company.findAll:', error);
            // Check if error is about missing column
            if (error.message && error.message.includes('parent_company_id')) {
                throw new Error(`Database migration required: Please run migration_add_parent_company.sql to add parent_company_id column. Original error: ${error.message}`);
            }
            throw new Error(`Failed to fetch companies: ${error.message}`);
        }
    }
    
    // Get sub-companies of a parent company
    static async getSubCompanies(parentCompanyId) {
        try {
            const hasParentColumn = await this.hasParentCompanyColumn();
            
            if (!hasParentColumn) {
                // If parent column doesn't exist, return empty array
                return [];
            }
            
            const [rows] = await pool.execute(`
                SELECT 
                    c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                    c.contact_phone, c.verification_form_link, c.is_active, c.created_by, 
                    c.parent_company_id, c.created_at, c.updated_at,
                    GROUP_CONCAT(
                        CASE WHEN cs.is_enabled = 1 THEN cs.service_name END
                        SEPARATOR ','
                    ) as enabled_services,
                    COALESCE(pending_apps.pending_count, 0) as pending_count
                FROM companies c
                LEFT JOIN company_services cs ON c.id = cs.company_id
                LEFT JOIN (
                    SELECT 
                        company_id,
                        COUNT(*) as pending_count
                    FROM applications 
                    WHERE application_status = 'pending'
                    GROUP BY company_id
                ) pending_apps ON c.id = pending_apps.company_id
                WHERE c.parent_company_id = ? AND c.is_active = TRUE
                GROUP BY c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                         c.contact_phone, c.verification_form_link, c.created_by, c.parent_company_id, 
                         c.created_at, c.updated_at, pending_apps.pending_count
                ORDER BY c.created_at DESC
            `, [parentCompanyId]);
            
            return rows.map(row => ({
                ...row,
                enabled_services: row.enabled_services ? row.enabled_services.split(',').filter(Boolean) : [],
                pending_count: parseInt(row.pending_count) || 0,
                company_link: `${config.frontendUrl}/user-form/${row.id}`
            }));
        } catch (error) {
            console.error('Error in Company.getSubCompanies:', error);
            throw new Error(`Failed to fetch sub-companies: ${error.message}`);
        }
    }

    // Save company services
    async saveServices(services) {
        try {
            // First, disable all services for this company
            await pool.execute(
                'UPDATE company_services SET is_enabled = FALSE WHERE company_id = ?',
                [this.id]
            );

            // Then enable the specified services
            for (const [serviceName, isEnabled] of Object.entries(services)) {
                if (isEnabled) {
                    await pool.execute(
                        `INSERT INTO company_services (company_id, service_name, is_enabled) 
                         VALUES (?, ?, TRUE) 
                         ON DUPLICATE KEY UPDATE is_enabled = TRUE`,
                        [this.id, serviceName]
                    );
                }
            }
        } catch (error) {
            console.error('Error saving company services:', error);
            throw new Error('Failed to save company services');
        }
    }

    // Get company services
    static async getCompanyServices(companyId) {
        try {
            const [rows] = await pool.execute(
                'SELECT service_name, is_enabled FROM company_services WHERE company_id = ?',
                [companyId]
            );
            
            const services = {};
            rows.forEach(row => {
                services[row.service_name] = Boolean(row.is_enabled);
            });
            
            return services;
        } catch (error) {
            throw new Error('Failed to get company services');
        }
    }

    // Check if a specific service is enabled
    static async isServiceEnabled(companyId, serviceName) {
        try {
            const [rows] = await pool.execute(
                'SELECT is_enabled FROM company_services WHERE company_id = ? AND service_name = ?',
                [companyId, serviceName]
            );
            
            return rows.length > 0 ? Boolean(rows[0].is_enabled) : false;
        } catch (error) {
            throw new Error('Failed to check service status');
        }
    }

    // Update company
    async update() {
        try {
            // Handle password hashing if password is provided
            let hashedPassword = this.password;
            if (this.password && !this.password.startsWith('$2a$')) {
                hashedPassword = await bcrypt.hash(this.password, 12);
            }

            // Check if parent_company_id column exists
            const hasParentColumn = await Company.hasParentCompanyColumn();
            
            // If parent_company_id is provided but column doesn't exist, throw helpful error
            if (this.parent_company_id !== undefined && this.parent_company_id !== null && !hasParentColumn) {
                throw new Error('Database migration required: Please run migration_add_parent_company.sql to add parent_company_id column before assigning parent companies.');
            }

            const baseUpdateFields = `name = ?, email = ?, password = ?, industry = ?, address = ?, 
                    contact_person = ?, contact_phone = ?, verification_form_link = ?, 
                    is_active = ?`;
            const baseParams = [
                this.name, this.email, hashedPassword, this.industry, this.address,
                this.contact_person, this.contact_phone, this.verification_form_link,
                this.is_active
            ];

            let updateFields = baseUpdateFields;
            let params = [...baseParams];

            if (hasParentColumn) {
                updateFields += ', parent_company_id = ?';
                params.push(this.parent_company_id !== undefined ? this.parent_company_id : null);
            }

            params.push(this.id); // Add id for WHERE clause

            const [result] = await pool.execute(
                `UPDATE companies SET 
                    ${updateFields}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                params
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Company update error:', error);
            if (error.message && error.message.includes('parent_company_id')) {
                throw error; // Re-throw the helpful error message
            }
            throw new Error(`Failed to update company: ${error.message}`);
        }
    }

    // Delete company (soft delete)
    static async delete(id) {
        try {
            const [result] = await pool.execute(
                'UPDATE companies SET is_active = FALSE WHERE id = ?',
                [id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to delete company');
        }
    }

    // Generate JWT token for company login
    generateToken() {
        if (!this.id) {
            throw new Error('Cannot generate token: Company ID not set');
        }
        
        return jwt.sign(
            { 
                id: this.id,
                email: this.email,
                user_type: 'company',
                full_name: this.name
            }, 
            config.jwtSecret, 
            { expiresIn: config.jwtExpiresIn }
        );
    }

    // Verify password for company login
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}

module.exports = Company;
