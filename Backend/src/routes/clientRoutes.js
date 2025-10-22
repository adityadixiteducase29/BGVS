const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/roleAuth');

// Public endpoints for UserForm visibility (no authentication required)
// These endpoints are used by the frontend to determine which form sections to show

// Get client services for UserForm visibility
router.get('/:clientId/services/visibility', 
    ClientController.getClientServices
);

// Check if specific service is enabled for UserForm visibility
router.get('/:clientId/services/:serviceName/status', 
    ClientController.checkServiceEnabled
);

// Apply authentication middleware to all remaining routes
router.use(authenticate);

// Create a new client (Admin only)
router.post('/', 
    requireAdmin, 
    ClientController.createClient
);

// Get all clients (Admin only)
router.get('/', 
    requireAdmin, 
    ClientController.getAllClients
);

// Get client by ID (Admin only)
router.get('/:id', 
    requireAdmin, 
    ClientController.getClientById
);

// Update client (Admin only)
router.put('/:id', 
    requireAdmin, 
    ClientController.updateClient
);

// Update client services (Admin only)
router.put('/:id/services', 
    requireAdmin, 
    ClientController.updateClientServices
);

// Deactivate client (Admin only)
router.delete('/:id', 
    requireAdmin, 
    ClientController.deactivateClient
);

// Get client statistics (Admin only)
router.get('/stats/overview', 
    requireAdmin, 
    ClientController.getClientStats
);

module.exports = router;
