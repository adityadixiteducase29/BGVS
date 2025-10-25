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
    }

    // Save company to database
    async save() {
        try {
            // Hash password if provided
            let hashedPassword = this.password;
            if (this.password && !this.password.startsWith('$2a$')) {
                hashedPassword = await bcrypt.hash(this.password, 12);
            }

            // Convert undefined values to null for database compatibility
            const params = [
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

            const [result] = await pool.execute(
                `INSERT INTO companies (
                    name, email, password, industry, address, contact_person, 
                    contact_phone, verification_form_link, is_active, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                params
            );
            
            this.id = result.insertId;
            return this;
        } catch (error) {
            console.error('Error saving company:', error);
            throw new Error('Failed to create company');
        }
    }

    // Find company by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM companies WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find company');
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

    // Get all companies
    static async findAll() {
        try {
            const [rows] = await pool.execute(`
                SELECT DISTINCT
                    c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                    c.contact_phone, c.verification_form_link, c.is_active, c.created_by, 
                    c.created_at, c.updated_at,
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
                WHERE c.is_active = TRUE
                GROUP BY c.id, c.name, c.email, c.industry, c.address, c.contact_person, 
                         c.contact_phone, c.verification_form_link, c.created_by, c.created_at, c.updated_at,
                         pending_apps.pending_count
                ORDER BY c.created_at DESC
            `);
            
            return rows.map(row => ({
                ...row,
                enabled_services: row.enabled_services ? row.enabled_services.split(',').filter(Boolean) : [],
                pending_count: parseInt(row.pending_count) || 0,
                company_link: `${config.frontendUrl}/user-form/${row.id}`
            }));
        } catch (error) {
            throw new Error('Failed to fetch companies');
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

            const [result] = await pool.execute(
                `UPDATE companies SET 
                    name = ?, email = ?, password = ?, industry = ?, address = ?, 
                    contact_person = ?, contact_phone = ?, verification_form_link = ?, 
                    is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    this.name, this.email, hashedPassword, this.industry, this.address,
                    this.contact_person, this.contact_phone, this.verification_form_link,
                    this.is_active, this.id
                ]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Company update error:', error);
            throw new Error('Failed to update company');
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
