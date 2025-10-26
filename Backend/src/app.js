const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/environment');
const { testConnection } = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Handle preflight requests
app.options('*', cors(config.cors));

// Logging middleware
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Body parsing middleware - Handle both JSON and FormData
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware for development
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`🔍 ${req.method} ${req.path}`);
        console.log('📝 Request Headers:', req.headers);
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('📦 Request Body:', req.body);
        }
        next();
    });
}

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});


// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Log error to file using Logger (import it here to avoid circular dependencies)
    const Logger = require('./utils/logger');
    Logger.logError(error, {
        req,
        res,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: error.status || 500,
    });
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(config.nodeEnv === 'development' && { stack: error.stack })
    });
});

// Initialize database connection
const initializeApp = async () => {
    try {
        // Test database connection
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Start server
        const server = app.listen(config.port, () => {
            console.log(`🚀 Server is running on port ${config.port}`);
            console.log(`🌍 Environment: ${config.nodeEnv}`);
            console.log(`📊 Health check: http://localhost:${config.port}/health`);
            console.log(`🔧 CORS enabled for: ${JSON.stringify(config.cors.origin)}`);
            
            // Log server start to file
            const Logger = require('./utils/logger');
            Logger.logInfo('Server started successfully', {
                port: config.port,
                environment: config.nodeEnv,
            });
            
            // Cleanup old logs on startup
            Logger.cleanupOldLogs(30);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            const Logger = require('./utils/logger');
            Logger.logInfo('SIGTERM received. Shutting down gracefully...');
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });

        process.on('SIGINT', () => {
            const Logger = require('./utils/logger');
            Logger.logInfo('SIGINT received. Shutting down gracefully...');
            console.log('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                console.log('Process terminated');
            });
        });

    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
};

module.exports = { app, initializeApp };
