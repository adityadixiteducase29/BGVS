const Client = require('../models/Client');
const { validateClientData } = require('../validation/clientValidation');

class ClientController {
    // Create a new client
    static async createClient(req, res) {
        try {
            const { client_name, client_email, password, services } = req.body;
            const created_by = req.user.id; // From JWT token

            // Validate input data
            const validation = validateClientData({ client_name, client_email, password, services });
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Check if client already exists
            const existingClient = await Client.findByEmail(client_email);
            if (existingClient) {
                return res.status(409).json({
                    success: false,
                    message: 'Client with this email already exists'
                });
            }

            // Create new client
            const client = new Client({
                client_name,
                client_email,
                password,
                services,
                created_by
            });

            // Hash password and save
            await client.hashPassword();
            const savedClient = await client.save();

            // Return client data without password
            const { password: _, ...clientData } = savedClient;
            
            res.status(201).json({
                success: true,
                message: 'Client created successfully',
                data: clientData
            });

        } catch (error) {
            console.error('Error creating client:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all clients
    static async getAllClients(req, res) {
        try {
            const clients = await Client.findAll();
            
            res.status(200).json({
                success: true,
                data: clients
            });

        } catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get client by ID
    static async getClientById(req, res) {
        try {
            const { id } = req.params;
            const client = await Client.findByIdWithServices(id);

            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }

            // Remove password from response
            const { password: _, ...clientData } = client;

            res.status(200).json({
                success: true,
                data: clientData
            });

        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update client
    static async updateClient(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Find client first
            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }

            // Update client data
            const updated = await client.update(updateData);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update client'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Client updated successfully'
            });

        } catch (error) {
            console.error('Error updating client:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update client services
    static async updateClientServices(req, res) {
        try {
            const { id } = req.params;
            const { services } = req.body;

            // Validate services
            if (!services || typeof services !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Services data is required'
                });
            }

            // Find client first
            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }

            // Update services
            await client.updateServices(services);

            res.status(200).json({
                success: true,
                message: 'Client services updated successfully'
            });

        } catch (error) {
            console.error('Error updating client services:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get client services (for UserForm visibility)
    static async getClientServices(req, res) {
        try {
            const { clientId } = req.params;
            const services = await Client.getClientServices(clientId);

            res.status(200).json({
                success: true,
                data: {
                    client_id: clientId,
                    services
                }
            });

        } catch (error) {
            console.error('Error fetching client services:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Check if specific service is enabled
    static async checkServiceEnabled(req, res) {
        try {
            const { clientId, serviceName } = req.params;
            const isEnabled = await Client.isServiceEnabled(clientId, serviceName);

            res.status(200).json({
                success: true,
                data: {
                    client_id: clientId,
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

    // Deactivate client
    static async deactivateClient(req, res) {
        try {
            const { id } = req.params;

            // Find client first
            const client = await Client.findById(id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }

            // Deactivate client
            const deactivated = await client.deactivate();

            if (!deactivated) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to deactivate client'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Client deactivated successfully'
            });

        } catch (error) {
            console.error('Error deactivating client:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get client statistics
    static async getClientStats(req, res) {
        try {
            const stats = await Client.getStats();
            
            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error fetching client statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = ClientController;
