const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Logger utility for writing error logs to files
 */
class Logger {
    /**
     * Get the current date string for log filename
     */
    static getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    /**
     * Get the current time string for log entries
     */
    static getTimeString() {
        const now = new Date();
        return now.toISOString(); // Full ISO timestamp
    }

    /**
     * Write error to log file
     * @param {Error} error - The error object
     * @param {Object} context - Additional context (req, res, etc.)
     */
    static logError(error, context = {}) {
        try {
            const logEntry = {
                timestamp: this.getTimeString(),
                error: {
                    message: error.message || 'Unknown error',
                    stack: error.stack || 'No stack trace',
                    code: error.code || 'NO_CODE',
                    statusCode: context.statusCode || context.res?.statusCode || 'NO_STATUS',
                },
                context: {
                    method: context.method || context.req?.method || 'UNKNOWN',
                    url: context.url || context.req?.originalUrl || context.req?.url || 'UNKNOWN',
                    headers: context.req?.headers || {},
                    body: context.req?.body || {},
                    params: context.req?.params || {},
                    query: context.req?.query || {},
                    userId: context.req?.user?.id || context.userId || 'NOT_AUTHENTICATED',
                    ip: context.req?.ip || context.req?.connection?.remoteAddress || 'UNKNOWN',
                },
                environment: {
                    nodeEnv: process.env.NODE_ENV || 'development',
                    port: process.env.PORT || 'NOT_SET',
                }
            };

            // Write to daily log file
            const logFile = path.join(logsDir, `error-${this.getDateString()}.log`);
            const logString = JSON.stringify(logEntry, null, 2) + '\n\n' + '='.repeat(80) + '\n\n';
            
            fs.appendFileSync(logFile, logString, 'utf8');

            // Also write to console in production
            if (process.env.NODE_ENV === 'production') {
                console.error('🚨 Error logged:', error.message);
            }
        } catch (logError) {
            console.error('Failed to write error log:', logError);
        }
    }

    /**
     * Write info log
     * @param {string} message - Info message
     * @param {Object} data - Additional data
     */
    static logInfo(message, data = {}) {
        try {
            const logEntry = {
                timestamp: this.getTimeString(),
                level: 'INFO',
                message,
                data,
            };

            const logFile = path.join(logsDir, `info-${this.getDateString()}.log`);
            const logString = JSON.stringify(logEntry, null, 2) + '\n\n';
            
            fs.appendFileSync(logFile, logString, 'utf8');
        } catch (logError) {
            console.error('Failed to write info log:', logError);
        }
    }

    /**
     * Write API request log
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {number} responseTime - Response time in ms
     */
    static logRequest(req, res, responseTime) {
        try {
            const logEntry = {
                timestamp: this.getTimeString(),
                method: req.method,
                url: req.originalUrl || req.url,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                ip: req.ip || req.connection?.remoteAddress || 'UNKNOWN',
                userId: req.user?.id || 'NOT_AUTHENTICATED',
            };

            const logFile = path.join(logsDir, `access-${this.getDateString()}.log`);
            const logString = JSON.stringify(logEntry, null, 2) + '\n';
            
            fs.appendFileSync(logFile, logString, 'utf8');
        } catch (logError) {
            console.error('Failed to write request log:', logError);
        }
    }

    /**
     * Clean up old log files (older than 30 days)
     */
    static cleanupOldLogs(daysToKeep = 30) {
        try {
            const files = fs.readdirSync(logsDir);
            const now = Date.now();
            const daysInMs = daysToKeep * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                
                if (now - stats.mtimeMs > daysInMs) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted old log file: ${file}`);
                }
            });
        } catch (error) {
            console.error('Failed to cleanup old logs:', error);
        }
    }
}

module.exports = Logger;

