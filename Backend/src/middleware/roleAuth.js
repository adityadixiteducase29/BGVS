const User = require('../models/User');

// Middleware to check if user has permission for specific actions
const requirePermission = (action) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get user from database to check current permissions
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user can perform the action
            if (!user.canPerformAction(action)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions for this action'
                });
            }

            // Add user object to request for controllers to use
            req.currentUser = user;
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during permission check'
            });
        }
    };
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Middleware to require verifier role
const requireVerifier = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'verifier') {
        return res.status(403).json({
            success: false,
            message: 'Verifier access required'
        });
    }
    next();
};

// Middleware to require company role
const requireCompany = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'company') {
        return res.status(403).json({
            success: false,
            message: 'Company access required'
        });
    }
    next();
};

// Middleware to require either admin or verifier role
const requireAdminOrVerifier = (req, res, next) => {
    if (!req.user || (req.user.user_type !== 'admin' && req.user.user_type !== 'verifier')) {
        return res.status(403).json({
            success: false,
            message: 'Admin or Verifier access required'
        });
    }
    next();
};

// Specific permission middleware functions
const canCreateCompany = requirePermission('create_company');
const canManageVerifiers = requirePermission('manage_verifiers');
const canViewAllApplications = requirePermission('view_all_applications');
const canAssignApplications = requirePermission('assign_applications');
const canReviewApplications = requirePermission('review_applications');
const canViewCompanyStats = requirePermission('view_company_stats');

module.exports = {
    requirePermission,
    requireAdmin,
    requireVerifier,
    requireCompany,
    requireAdminOrVerifier,
    canCreateCompany,
    canManageVerifiers,
    canViewAllApplications,
    canAssignApplications,
    canReviewApplications,
    canViewCompanyStats
};
