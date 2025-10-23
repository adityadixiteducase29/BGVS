const mysql = require('mysql2');

// Load environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'verification_user',
    password: process.env.DB_PASSWORD || 'Verification@123',
    database: process.env.DB_NAME || 'background_verification_system',
    port: process.env.DB_PORT || 3306,
    // SSL configuration for Aiven MySQL
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
};

// Create a single connection for testing
let connection;
let pool;

// Test the connection
const testConnection = async () => {
    try {
        // First try with a single connection
        connection = mysql.createConnection(dbConfig);
        
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err.message);
                    console.error('🔍 Error details:', err);
                    reject(err);
                    return;
                }
                
                console.log('✅ Database connected successfully!');
                console.log(`📊 Using database: ${dbConfig.database}`);
                console.log(`👤 Connected as user: ${dbConfig.user}`);
                
                // If connection works, create the pool
                pool = mysql.createPool(dbConfig);
                const promisePool = pool.promise();
                
                // Close the test connection
                connection.end();
                
                resolve(true);
            });
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Get the promise pool
const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool.promise();
};

// Get database statistics
const getDatabaseStats = async () => {
    try {
        const promisePool = getPool();
        const [tables] = await promisePool.execute(`
            SELECT 
                TABLE_NAME,
                TABLE_ROWS,
                ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [dbConfig.database]);
        
        return tables;
    } catch (error) {
        console.error('Error getting database stats:', error);
        return [];
    }
};

module.exports = {
    pool: getPool(),
    testConnection,
    getDatabaseStats
};
