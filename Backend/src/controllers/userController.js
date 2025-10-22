const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/environment');
const { pool } = require('../config/database');

class UserController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, password, first_name, last_name, user_type } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Create new user
            const user = new User({ email, password, first_name, last_name, user_type });
            await user.hashPassword();
            await user.save();

            // Generate token
            const token = user.generateToken();

            // Return success response
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    user_type: user.user_type,
                    full_name: user.fullName,
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Login user (handles both regular users and company users)
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // First try to find as regular user
            let user = await User.findByEmail(email);
            let isCompany = false;

            // If not found as user, try as company
            if (!user) {
                const company = await Company.findByEmail(email);
                if (company) {
                    user = company;
                    isCompany = true;
                }
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    user_type: isCompany ? 'company' : user.user_type 
                },
                config.jwtSecret,
                { expiresIn: config.jwtExpiresIn }
            );

            // Return success response
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user.id,
                    email: user.email,
                    first_name: isCompany ? user.name : user.first_name,
                    last_name: isCompany ? '' : user.last_name,
                    user_type: isCompany ? 'company' : user.user_type,
                    full_name: isCompany ? user.name : `${user.first_name} ${user.last_name}`,
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get all users (admin only)
    static async getAllUsers(req, res) {
        try {
            const users = await User.findByType('verifier');
            
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get all verifiers with assignments (admin only)
    static async getAllVerifiersWithAssignments(req, res) {
        try {
            const verifiers = await User.getAllVerifiersWithAssignments();
            
            res.json({
                success: true,
                data: verifiers
            });
        } catch (error) {
            console.error('Get verifiers with assignments error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get user dashboard data based on role
    static async getDashboardData(req, res) {
        try {
            const userData = await User.findById(req.user.id);
            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Create a User instance to access methods
            const user = new User(userData);
            user.id = userData.id; // Ensure ID is set
            
            const dashboardData = await user.getDashboardData();
            
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        user_type: user.user_type,
                        full_name: user.fullName
                    },
                    dashboard: dashboardData
                }
            });
        } catch (error) {
            console.error('Get dashboard data error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get user profile with role-specific information
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Remove sensitive information
            delete user.password;

            // Add role-specific data
            let profileData = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                user_type: user.user_type,
                full_name: user.fullName,
                is_active: user.is_active,
                created_at: user.created_at,
                updated_at: user.updated_at
            };

            // Add role-specific information
            if (user.isVerifier()) {
                const assignedCompanies = await user.getAssignedCompanies();
                profileData.assigned_companies = assignedCompanies;
            }

            res.json({
                success: true,
                data: profileData
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Update user profile
    static async updateProfile(req, res) {
        try {
            const { first_name, last_name, email } = req.body;
            const updateData = {};

            if (first_name) updateData.first_name = first_name;
            if (last_name) updateData.last_name = last_name;
            if (email) updateData.email = email;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== user.email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already taken'
                    });
                }
            }

            // Update user
            await user.update(updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    full_name: user.fullName
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isValidPassword = await user.verifyPassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Change password
            await user.changePassword(newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get user statistics (admin only)
    static async getUserStats(req, res) {
        try {
            const stats = await User.getStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Create admin user (developer only - no authentication required)
    static async createAdmin(req, res) {
        try {
            // This endpoint should only be accessible by developers
            // In production, you might want to add additional security
            const { email, password, first_name, last_name } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Create new admin user
            const user = new User({ 
                email, 
                password, 
                first_name, 
                last_name, 
                user_type: 'admin' 
            });
            
            await user.hashPassword();
            await user.save();

            // Generate token
            const token = user.generateToken();

            // Return success response
            res.status(201).json({
                success: true,
                message: 'Admin user created successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    user_type: user.user_type,
                    full_name: user.fullName,
                    token
                }
            });
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get verifier applications (verifier only)
    static async getVerifierApplications(req, res) {
        try {
            console.log('getVerifierApplications called with user_id:', req.user.id);
            
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('User found:', user.email, user.user_type);

            // First, let's check if the verifier has any assignments
            const [assignments] = await pool.execute(`
                SELECT va.company_id, c.name as company_name
                FROM verifier_assignments va
                INNER JOIN companies c ON va.company_id = c.id
                WHERE va.verifier_id = ? AND va.is_active = TRUE AND c.is_active = TRUE
            `, [req.user.id]);

            console.log('Verifier assignments found:', assignments.length);

            if (assignments.length === 0) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            // Get applications for companies assigned to this verifier
            const [applications] = await pool.execute(`
                SELECT 
                    a.id,
                    a.applicant_first_name,
                    a.applicant_last_name,
                    a.applicant_email,
                    a.applicant_phone,
                    a.application_status,
                    a.created_at,
                    a.assigned_verifier_id,
                    a.assigned_at,
                    c.name as company_name,
                    c.id as company_id,
                    CONCAT(a.applicant_first_name, ' ', a.applicant_last_name) as applicant_name,
                    CONCAT(u.first_name, ' ', u.last_name) as assigned_verifier_name
                FROM applications a
                INNER JOIN companies c ON a.company_id = c.id
                INNER JOIN verifier_assignments va ON c.id = va.company_id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE va.verifier_id = ? 
                AND va.is_active = TRUE 
                AND c.is_active = TRUE
                AND a.application_status IN ('pending', 'assigned', 'under_review')
                ORDER BY a.created_at DESC
            `, [req.user.id]);

            console.log('Applications found:', applications.length);

            // Transform the data
            try {
                const transformedApplications = applications.map(app => ({
                    id: app.id,
                    applicantName: app.applicant_name,
                    documentType: 'Background Verification', // Default document type
                    submittedDate: new Date(app.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    priority: UserController.getPriority(app.created_at), // Helper function to determine priority
                    status: app.application_status,
                    companyName: app.company_name,
                    applicantEmail: app.applicant_email,
                    applicantPhone: app.applicant_phone,
                    created_at: app.created_at,
                    is_assigned: app.assigned_verifier_id ? 'yes' : 'no',
                    assigned_verifier_name: app.assigned_verifier_name || null,
                    assigned_verifier_id: app.assigned_verifier_id || null
                }));

                console.log('Data transformation completed successfully');

                res.json({
                    success: true,
                    data: transformedApplications
                });
            } catch (transformError) {
                console.error('Data transformation error:', transformError);
                throw transformError;
            }
        } catch (error) {
            console.error('Get verifier applications error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                user_id: req.user?.id
            });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get pending applications for verifier
    static async getVerifierPendingApplications(req, res) {
        try {
            console.log('getVerifierPendingApplications called with user_id:', req.user.id);
            
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get applications for companies assigned to this verifier with pending status
            const [applications] = await pool.execute(`
                SELECT 
                    a.id,
                    a.applicant_first_name,
                    a.applicant_last_name,
                    a.applicant_email,
                    a.applicant_phone,
                    a.application_status,
                    a.created_at,
                    a.assigned_verifier_id,
                    a.assigned_at,
                    c.name as company_name,
                    c.id as company_id,
                    CONCAT(a.applicant_first_name, ' ', a.applicant_last_name) as applicant_name,
                    CONCAT(u.first_name, ' ', u.last_name) as assigned_verifier_name
                FROM applications a
                INNER JOIN companies c ON a.company_id = c.id
                INNER JOIN verifier_assignments va ON c.id = va.company_id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE va.verifier_id = ? 
                AND va.is_active = TRUE 
                AND c.is_active = TRUE
                AND a.application_status IN ('pending', 'assigned', 'under_review')
                ORDER BY a.created_at DESC
            `, [req.user.id]);

            // Transform the data
            const transformedApplications = applications.map(app => ({
                id: app.id,
                applicantName: app.applicant_name,
                documentType: 'Background Verification',
                submittedDate: new Date(app.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                priority: UserController.getPriority(app.created_at),
                status: app.application_status,
                companyName: app.company_name,
                applicantEmail: app.applicant_email,
                applicantPhone: app.applicant_phone,
                created_at: app.created_at,
                is_assigned: app.assigned_verifier_id ? 'yes' : 'no',
                assigned_verifier_name: app.assigned_verifier_name || null,
                assigned_verifier_id: app.assigned_verifier_id || null
            }));

            res.json({
                success: true,
                data: transformedApplications
            });
        } catch (error) {
            console.error('Get verifier pending applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get approved applications for verifier
    static async getVerifierApprovedApplications(req, res) {
        try {
            console.log('getVerifierApprovedApplications called with user_id:', req.user.id);
            
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get applications for companies assigned to this verifier with approved status
            const [applications] = await pool.execute(`
                SELECT 
                    a.id,
                    a.applicant_first_name,
                    a.applicant_last_name,
                    a.applicant_email,
                    a.applicant_phone,
                    a.application_status,
                    a.created_at,
                    a.assigned_verifier_id,
                    a.assigned_at,
                    a.reviewed_at,
                    c.name as company_name,
                    c.id as company_id,
                    CONCAT(a.applicant_first_name, ' ', a.applicant_last_name) as applicant_name,
                    CONCAT(u.first_name, ' ', u.last_name) as assigned_verifier_name
                FROM applications a
                INNER JOIN companies c ON a.company_id = c.id
                INNER JOIN verifier_assignments va ON c.id = va.company_id
                LEFT JOIN users u ON a.assigned_verifier_id = u.id
                WHERE va.verifier_id = ? 
                AND va.is_active = TRUE 
                AND c.is_active = TRUE
                AND a.application_status IN ('approved', 'rejected')
                ORDER BY a.reviewed_at DESC, a.created_at DESC
            `, [req.user.id]);

            // Transform the data
            const transformedApplications = applications.map(app => ({
                id: app.id,
                applicantName: app.applicant_name,
                documentType: 'Background Verification',
                submittedDate: new Date(app.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                reviewedDate: app.reviewed_at ? new Date(app.reviewed_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }) : null,
                priority: UserController.getPriority(app.created_at),
                status: app.application_status,
                companyName: app.company_name,
                applicantEmail: app.applicant_email,
                applicantPhone: app.applicant_phone,
                created_at: app.created_at,
                reviewed_at: app.reviewed_at,
                is_assigned: app.assigned_verifier_id ? 'yes' : 'no',
                assigned_verifier_name: app.assigned_verifier_name || null,
                assigned_verifier_id: app.assigned_verifier_id || null
            }));

            res.json({
                success: true,
                data: transformedApplications
            });
        } catch (error) {
            console.error('Get verifier approved applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Helper function to determine priority based on creation date
    static getPriority(createdAt) {
        const now = new Date();
        const created = new Date(createdAt);
        const hoursDiff = (now - created) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) return 'High';
        if (hoursDiff > 12) return 'Medium';
        return 'Low';
    }

    // Get verifier dashboard statistics
    static async getVerifierStats(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get statistics for applications assigned to this verifier
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_applications,
                    SUM(CASE WHEN a.application_status = 'pending' THEN 1 ELSE 0 END) as pending_review,
                    SUM(CASE WHEN a.application_status = 'approved' AND DATE(a.reviewed_at) = CURDATE() THEN 1 ELSE 0 END) as approved_today,
                    SUM(CASE WHEN a.application_status = 'rejected' AND DATE(a.reviewed_at) = CURDATE() THEN 1 ELSE 0 END) as rejected_today
                FROM applications a
                INNER JOIN companies c ON a.company_id = c.id
                INNER JOIN verifier_assignments va ON c.id = va.company_id
                WHERE va.verifier_id = ? 
                AND va.is_active = TRUE 
                AND c.is_active = TRUE
            `, [req.user.id]);

            const dashboardStats = {
                total_applications: parseInt(stats[0]?.total_applications || 0),
                pending_review: parseInt(stats[0]?.pending_review || 0),
                approved_today: parseInt(stats[0]?.approved_today || 0),
                rejected_today: parseInt(stats[0]?.rejected_today || 0)
            };

            res.json({
                success: true,
                data: dashboardStats
            });
        } catch (error) {
            console.error('Get verifier stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get verifier companies (verifier only)
    static async getVerifierCompanies(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const assignedCompanies = await user.getAssignedCompanies();
            
            res.json({
                success: true,
                data: assignedCompanies
            });
        } catch (error) {
            console.error('Get verifier companies error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get company applications (company only) - placeholder for future
    static async getCompanyApplications(req, res) {
        try {
            res.json({
                success: true,
                message: 'Company applications endpoint - to be implemented in future phase',
                data: []
            });
        } catch (error) {
            console.error('Get company applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Get company stats (company only) - placeholder for future
    static async getCompanyStats(req, res) {
        try {
            res.json({
                success: true,
                message: 'Company stats endpoint - to be implemented in future phase',
                data: {}
            });
        } catch (error) {
            console.error('Get company stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = UserController;
