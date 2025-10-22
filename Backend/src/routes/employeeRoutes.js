const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/authenticate');
const { requireAdmin } = require('../middleware/roleAuth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all employees (Admin only)
router.get('/', 
    requireAdmin, 
    EmployeeController.getAllEmployees
);

// Create new employee (Admin only)
router.post('/', 
    requireAdmin, 
    EmployeeController.createEmployee
);

// Get employee dashboard statistics (Admin only)
router.get('/stats/dashboard', 
    requireAdmin, 
    EmployeeController.getEmployeeStats
);

// Get employee by ID (Admin only)
router.get('/:id', 
    requireAdmin, 
    EmployeeController.getEmployeeById
);

// Update employee (Admin only)
router.put('/:id', 
    requireAdmin, 
    EmployeeController.updateEmployee
);

// Delete employee (Admin only)
router.delete('/:id', 
    requireAdmin, 
    EmployeeController.deleteEmployee
);

module.exports = router;
