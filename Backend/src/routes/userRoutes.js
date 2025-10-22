const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { 
    requireAdmin, 
    requireVerifier, 
    requireCompany,
    requireAdminOrVerifier 
} = require('../middleware/roleAuth');
const { 
    validateRegistration, 
    validateLogin, 
    validateProfileUpdate,
    validatePasswordChange 
} = require('../validation/userValidation');

// Public routes (no authentication required)
router.post('/register', validateRegistration, UserController.register);
router.post('/login', validateLogin, UserController.login);

// Developer-only route (no authentication required)
router.post('/create-admin', validateRegistration, UserController.createAdmin);

// Protected routes (authentication required)
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validateProfileUpdate, UserController.updateProfile);
router.put('/change-password', authenticate, validatePasswordChange, UserController.changePassword);
router.get('/dashboard', authenticate, UserController.getDashboardData);

// Admin-only routes
router.get('/all', authenticate, requireAdmin, UserController.getAllUsers);
router.get('/verifiers-with-assignments', authenticate, requireAdmin, UserController.getAllVerifiersWithAssignments);
router.get('/stats', authenticate, requireAdmin, UserController.getUserStats);

// Verifier-specific routes
router.get('/verifier/applications', authenticate, requireVerifier, UserController.getVerifierApplications);
router.get('/verifier/applications/pending', authenticate, requireVerifier, UserController.getVerifierPendingApplications);
router.get('/verifier/applications/approved', authenticate, requireVerifier, UserController.getVerifierApprovedApplications);
router.get('/verifier/stats', authenticate, requireVerifier, UserController.getVerifierStats);
router.get('/verifier/companies', authenticate, requireVerifier, UserController.getVerifierCompanies);

// Company-specific routes (for future implementation)
router.get('/company/applications', authenticate, requireCompany, UserController.getCompanyApplications);
router.get('/company/stats', authenticate, requireCompany, UserController.getCompanyStats);

module.exports = router;
