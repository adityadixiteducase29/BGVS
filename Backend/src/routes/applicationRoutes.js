const express = require('express');
const router = express.Router();
const multer = require('multer');
const ApplicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin, requireVerifier } = require('../middleware/roleAuth');

// Configure multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Public routes (no authentication required)
// These are used by the UserForm to submit applications

// Create application from UserForm
router.post('/companies/:companyId/applications', 
    upload.any(), // Handle any file uploads
    ApplicationController.createApplication
);

// Get applications for a specific company (public - for UserForm)
router.get('/companies/:companyId/applications', 
    ApplicationController.getCompanyApplications
);

// Protected routes (require authentication)
router.use(authenticate);

// Get all applications (Admin only)
router.get('/', 
    requireAdmin, 
    ApplicationController.getAllApplications
);

// Get application by ID (Admin and Verifier)
router.get('/:id', 
    ApplicationController.getApplicationById
);

// Assign application to verifier (Admin only)
router.post('/:id/assign', 
    requireAdmin, 
    ApplicationController.assignToVerifier
);

// Auto-assign application to current verifier (Verifier only)
router.post('/:id/auto-assign', 
    requireVerifier, 
    ApplicationController.assignToCurrentVerifier
);

// Approve application (Verifier only)
router.post('/:id/approve', 
    requireVerifier, 
    ApplicationController.approveApplication
);

// Reject application (Verifier only)
router.post('/:id/reject', 
    requireVerifier, 
    ApplicationController.rejectApplication
);

// Get application statistics (Admin only)
router.get('/stats/overview', 
    requireAdmin, 
    ApplicationController.getApplicationStats
);

// Delete application (Admin only)
router.delete('/:id', 
    requireAdmin, 
    ApplicationController.deleteApplication
);

module.exports = router;
