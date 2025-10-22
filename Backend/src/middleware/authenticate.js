const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const config = require('../config/environment');

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if token starts with 'Bearer '
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwtSecret);
            
            // Check if it's a company user or regular user
            if (decoded.user_type === 'company') {
                // Find company in database
                const company = await Company.findById(decoded.id);
                if (!company) {
                    return res.status(401).json({
                        success: false,
                        message: 'Access denied. Company not found.'
                    });
                }

                // Add company to request object
                req.user = {
                    id: company.id,
                    email: company.email,
                    first_name: company.name,
                    last_name: '',
                    user_type: 'company',
                    company_id: company.id,
                    full_name: company.name
                };
            } else {
                // Find user in database
                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Access denied. User not found.'
                    });
                }

                // Add user to request object
                req.user = {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    user_type: user.user_type,
                    full_name: `${user.first_name} ${user.last_name}`
                };
            }

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Token has expired.'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Invalid token.'
                });
            } else {
                throw jwtError;
            }
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};

module.exports = { authenticate };
