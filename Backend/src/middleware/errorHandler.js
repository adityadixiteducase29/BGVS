const Logger = require('../utils/logger');

/**
 * Wrapper for async route handlers to catch errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            // Log the error
            Logger.logError(error, {
                req,
                res,
                method: req.method,
                url: req.originalUrl || req.url,
            });
            
            // Pass to global error handler
            next(error);
        });
    };
};

/**
 * Helper to log errors in try-catch blocks
 */
const logError = (error, context = {}) => {
    Logger.logError(error, context);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
};

module.exports = {
    asyncHandler,
    logError,
};

