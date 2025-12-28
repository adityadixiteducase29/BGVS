const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Validate required environment variables
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
    console.error('❌ Missing AWS S3 configuration. Please set:');
    console.error('   - AWS_REGION');
    console.error('   - AWS_ACCESS_KEY_ID');
    console.error('   - AWS_SECRET_ACCESS_KEY');
    console.error('   - AWS_S3_BUCKET_NAME');
}

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'bgvs-storage';

module.exports = {
    s3Client,
    BUCKET_NAME
};

