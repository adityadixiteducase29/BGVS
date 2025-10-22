require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Database configuration
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'verification_user',
        password: process.env.DB_PASSWORD || 'Verification@123',
        name: process.env.DB_NAME || 'background_verification_system',
        port: process.env.DB_PORT || 3306
    },
    
    // Security configuration
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    
    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
        optionsSuccessStatus: 200
    }
};

module.exports = config;
