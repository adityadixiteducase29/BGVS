const express = require('express');
const router = express.Router();
const multer = require('multer');
const ApplicationController = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin, requireVerifier } = require('../middleware/roleAuth');

// Configure multer for CSV files only (for import)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    }
});

// Configure multer for document uploads (images, PDFs) - for application creation and updates
const uploadDocuments = multer({
    storage: multer.memoryStorage(), // Store in memory instead of disk for serverless
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/pdf'
        ];
        
        if (allowedMimes.includes(file.mimetype) || 
            /\.(jpg|jpeg|png|gif|pdf)$/i.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, GIF) and PDF files are allowed'), false);
        }
    }
});

// Configure multer for report uploads (PDFs only)
const uploadReport = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit for reports
    },
    fileFilter: (req, file, cb) => {
        // Allow PDFs and common document formats
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedMimes.includes(file.mimetype) || 
            /\.(pdf|doc|docx)$/i.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed for reports'), false);
        }
    }
});

// Public routes (no authentication required)
// These are used by the UserForm to submit applications

// Create application from UserForm
router.post('/companies/:companyId/applications', 
    uploadDocuments.any(), // Handle document file uploads
    ApplicationController.createApplication
);

// Get applications for a specific company (public - for UserForm)
router.get('/companies/:companyId/applications', 
    ApplicationController.getCompanyApplications
);

// Get application statistics (Admin only) - Must be before /:id route
router.get('/stats/overview', 
    requireAdmin, 
    ApplicationController.getApplicationStats
);

// Get basic applicant details (Admin and Verifier) - Must be before /:id route
router.get('/:id/basic-details', 
    ApplicationController.getApplicationBasicDetails
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

// Update application (Admin only)
router.put('/:id', 
    requireAdmin,
    uploadDocuments.any(), // Handle document file uploads
    ApplicationController.updateApplication
);

// Delete a specific document (Admin only)
router.delete('/documents/:documentId', 
    requireAdmin, 
    ApplicationController.deleteDocument
);

// Delete application (Admin only)
router.delete('/:id', 
    requireAdmin, 
    ApplicationController.deleteApplication
);

// CSV Import/Export routes (Admin only)
// Generate CSV template for bulk import
router.get('/companies/:companyId/csv-template', 
    requireAdmin, 
    ApplicationController.generateCSVTemplate
);

// Import applications from CSV
router.post('/companies/:companyId/import-csv', 
    requireAdmin,
    upload.single('csvFile'),
    ApplicationController.importFromCSV
);

// Export applications to Excel (Admin only)
router.get('/export/excel', 
    requireAdmin, 
    ApplicationController.exportToExcel
);

// Report routes (Admin and Verifier)
// Upload report for an application
router.post('/:id/reports', 
    authenticate,
    uploadReport.single('report'),
    ApplicationController.uploadReport
);

// Get reports for an application
router.get('/:id/reports', 
    authenticate,
    ApplicationController.getApplicationReports
);

// Get pre-signed URL for report download
router.get('/reports/:reportId/download', 
    authenticate,
    ApplicationController.getReportDownloadUrl
);

// Delete report (Admin or report uploader)
router.delete('/reports/:reportId', 
    authenticate,
    ApplicationController.deleteReport
);

module.exports = router;
