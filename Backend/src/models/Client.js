const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const config = require('../config/environment');

class Client {
    constructor(clientData) {
        this.id = clientData.id || null;
        this.client_name = clientData.client_name;
        this.client_email = clientData.client_email;
        this.password = clientData.password;
        this.is_active = clientData.is_active !== undefined ? clientData.is_active : true;
        this.created_by = clientData.created_by;
        this.services = clientData.services || {};
    }

    // Hash password
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, config.bcryptRounds);
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Save client to database
    async save() {
        try {
            // Start transaction
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Insert client
                const [clientResult] = await connection.execute(
                    'INSERT INTO clients (client_name, client_email, password, created_by) VALUES (?, ?, ?, ?)',
                    [this.client_name, this.client_email, this.password, this.created_by]
                );
                
                this.id = clientResult.insertId;

                // Insert client services
                await this.saveServices(connection);

                await connection.commit();
                return this;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Client with this email already exists');
            }
            throw new Error('Failed to create client');
        }
    }

    // Save client services
    async saveServices(connection = null) {
        const conn = connection || pool;
        
        try {
            // Only delete existing services if this is an update (client already has an ID)
            if (this.id) {
                await conn.execute(
                    'DELETE FROM client_services WHERE client_id = ?',
                    [this.id]
                );
            }

            // Insert new services
            for (const [serviceName, isEnabled] of Object.entries(this.services)) {
                if (isEnabled) {
                    await conn.execute(
                        'INSERT INTO client_services (client_id, service_name, is_enabled) VALUES (?, ?, ?)',
                        [this.id, serviceName, true]
                    );
                }
            }
        } catch (error) {
            console.error('Error saving client services:', error);
            throw new Error('Failed to save client services');
        }
    }

    // Find client by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM clients WHERE client_email = ? AND is_active = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find client');
        }
    }

    // Find client by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM clients WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error('Failed to find client');
        }
    }

    // Get client with services
    static async findByIdWithServices(id) {
        try {
            // Get client data
            const [clientRows] = await pool.execute(
                'SELECT * FROM clients WHERE id = ? AND is_active = TRUE',
                [id]
            );

            if (clientRows.length === 0) {
                return null;
            }

            const client = clientRows[0];

            // Get client services
            const [serviceRows] = await pool.execute(
                'SELECT service_name, is_enabled FROM client_services WHERE client_id = ?',
                [id]
            );

            // Convert services to object
            const services = {};
            serviceRows.forEach(row => {
                services[row.service_name] = row.is_enabled;
            });

            return { ...client, services };
        } catch (error) {
            throw new Error('Failed to find client with services');
        }
    }

    // Find all clients with service count
    static async findAll() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    c.id, 
                    c.client_name, 
                    c.client_email, 
                    c.is_active, 
                    c.created_at,
                    c.updated_at,
                    COUNT(cs.id) as enabled_services_count,
                    GROUP_CONCAT(CASE WHEN cs.is_enabled = TRUE THEN cs.service_name END) as enabled_services
                FROM clients c
                LEFT JOIN client_services cs ON c.id = cs.client_id AND cs.is_enabled = TRUE
                WHERE c.is_active = TRUE
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `);
            
            // Process the results to format services and add company link
            return rows.map(client => ({
                ...client,
                enabled_services: client.enabled_services ? client.enabled_services.split(',') : [],
                company_link: `${config.frontendUrl}/user-form/${client.id}`,
                created_at: new Date(client.created_at).toISOString(),
                updated_at: new Date(client.updated_at).toISOString()
            }));
        } catch (error) {
            throw new Error('Failed to fetch clients');
        }
    }

    // Update client
    async update(updateData) {
        try {
            const allowedFields = ['client_name', 'client_email', 'is_active'];
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
                `UPDATE clients SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );

            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to update client');
        }
    }

    // Update client services
    async updateServices(newServices) {
        try {
            this.services = newServices;
            await this.saveServices();
            return true;
        } catch (error) {
            throw new Error('Failed to update client services');
        }
    }

    // Change password
    async changePassword(newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);
            const [result] = await pool.execute(
                'UPDATE clients SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to change password');
        }
    }

    // Deactivate client
    async deactivate() {
        try {
            const [result] = await pool.execute(
                'UPDATE clients SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [this.id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Failed to deactivate client');
        }
    }

    // Get client services for UserForm visibility
    static async getClientServices(clientId) {
        try {
            const [rows] = await pool.execute(
                'SELECT service_name, is_enabled FROM client_services WHERE client_id = ?',
                [clientId]
            );

            const services = {};
            rows.forEach(row => {
                // Convert MySQL integer (1/0) to boolean (true/false)
                services[row.service_name] = Boolean(row.is_enabled);
            });

            return services;
        } catch (error) {
            throw new Error('Failed to fetch client services');
        }
    }

    // Check if a specific service is enabled for a client
    static async isServiceEnabled(clientId, serviceName) {
        try {
            const [rows] = await pool.execute(
                'SELECT is_enabled FROM client_services WHERE client_id = ? AND service_name = ?',
                [clientId, serviceName]
            );

            return rows.length > 0 && Boolean(rows[0].is_enabled);
        } catch (error) {
            throw new Error('Failed to check service status');
        }
    }

    // Get client statistics
    static async getStats() {
        try {
            const [clientStats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_clients,
                    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_clients
                FROM clients
            `);

            const [serviceStats] = await pool.execute(`
                SELECT 
                    service_name,
                    COUNT(*) as enabled_count
                FROM client_services 
                WHERE is_enabled = TRUE
                GROUP BY service_name
            `);

            return {
                clientStats: clientStats[0],
                serviceStats
            };
        } catch (error) {
            throw new Error('Failed to fetch client statistics');
        }
    }
}

module.exports = Client;
