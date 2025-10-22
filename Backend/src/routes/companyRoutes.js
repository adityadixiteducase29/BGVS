const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/roleAuth');

// Public endpoints for UserForm visibility (no authentication required)
// These endpoints are used by the frontend to determine which form sections to show

// Get company services for UserForm visibility
router.get('/:companyId/services/visibility', 
    CompanyController.getCompanyServices
);

// Check if specific service is enabled for UserForm visibility
router.get('/:companyId/services/:serviceName/status', 
    CompanyController.checkServiceEnabled
);

// Apply authentication middleware to all remaining routes
router.use(authenticate);

// Create a new company (Admin only)
router.post('/', 
    requireAdmin, 
    CompanyController.createCompany
);

// Get all companies (Admin only)
router.get('/', 
    requireAdmin, 
    CompanyController.getAllCompanies
);

// Get company statistics (Admin only)
router.get('/stats/overview', 
    requireAdmin, 
    CompanyController.getCompanyStats
);

// Get dashboard statistics (Admin only)
router.get('/stats/dashboard', 
    requireAdmin, 
    CompanyController.getDashboardStats
);

// Get companies dropdown (Admin only)
router.get('/dropdown', 
    requireAdmin, 
    CompanyController.getCompaniesDropdown
);

// Get company employees (Company/Client access)
router.get('/employees', 
    CompanyController.getCompanyEmployees
);

// Get company by ID (Admin only)
router.get('/:id', 
    requireAdmin, 
    CompanyController.getCompanyById
);

// Update company (Admin only)
router.put('/:id', 
    requireAdmin, 
    CompanyController.updateCompany
);

// Update company services (Admin only)
router.put('/:id/services', 
    requireAdmin, 
    CompanyController.updateCompanyServices
);

// Deactivate company (Admin only)
router.delete('/:id', 
    requireAdmin, 
    CompanyController.deactivateCompany
);

module.exports = router;
