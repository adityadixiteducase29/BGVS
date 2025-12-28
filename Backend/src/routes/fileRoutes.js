const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

// Custom authentication middleware for file access
const authenticateFileAccess = async (req, res, next) => {
    try {
        // Try to get token from Authorization header
        const authHeader = req.headers.authorization;
        let token = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        
        // If no token in header, try to get from query parameter
        if (!token && req.query.token) {
            token = req.query.token;
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('File access authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Helper function to extract S3 key from file
function extractS3Key(file) {
    // First try to get from cloudinary_public_id column (we're reusing it for S3 key)
    if (file.cloudinary_public_id) {
        return file.cloudinary_public_id;
    }
    
    // If file_path is an S3 URL, extract the key
    if (file.file_path && file.file_path.includes('.amazonaws.com/')) {
        try {
            const urlParts = file.file_path.split('.amazonaws.com/');
            if (urlParts.length > 1) {
                return urlParts[1];
            }
        } catch (error) {
            console.error('Error extracting S3 key from URL:', error);
        }
    }
    
    // If file_path is just the S3 key (without full URL)
    if (file.file_path && (file.file_path.startsWith('development/') || file.file_path.startsWith('production/'))) {
        return file.file_path;
    }
    
    return null;
}

// ============================================================================
// Get pre-signed URL for file access (expires in 1 hour)
// ============================================================================
router.get('/:fileId/presigned-url', authenticateFileAccess, async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log(`🔐 Pre-signed URL request: ${fileId} from user: ${req.user.email}`);
        
        // Get file information from database
        const [rows] = await pool.execute(
            `SELECT * FROM application_documents WHERE id = ?`,
            [fileId]
        );
        
        if (rows.length === 0) {
            console.log(`❌ File not found in database: ${fileId}`);
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        const file = rows[0];
        
        // Extract S3 key
        const s3Key = extractS3Key(file);
        
        if (!s3Key) {
            // If not in S3 yet, return the file_path directly (for backward compatibility with old files)
            console.log(`⚠️  File not in S3, returning direct URL: ${file.file_path}`);
            return res.json({
                success: true,
                url: file.file_path,
                expiresAt: null,
                fileName: file.document_name,
                mimeType: file.mime_type,
                isS3: false
            });
        }
        
        // Generate pre-signed URL (expires in 1 hour)
        const expiresIn = 3600; // 1 hour in seconds
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
        
        const getObjectCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            ResponseContentDisposition: `inline; filename="${encodeURIComponent(file.document_name)}"`,
            ResponseContentType: file.mime_type || 'application/octet-stream'
        });
        
        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn });
        
        console.log(`✅ Generated pre-signed URL for file: ${fileId}`);
        
        return res.json({
            success: true,
            url: signedUrl,
            expiresAt: expiresAt,
            fileName: file.document_name,
            mimeType: file.mime_type,
            isS3: true
        });
        
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================================================
// Get file URL endpoint (returns pre-signed URL or direct URL)
// ============================================================================
router.get('/:fileId', authenticateFileAccess, async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log(`🔍 File request: ${fileId} from user: ${req.user.email}`);
        
        // Get file information from database
        const [rows] = await pool.execute(
            `SELECT * FROM application_documents WHERE id = ?`,
            [fileId]
        );
        
        if (rows.length === 0) {
            console.log(`❌ File not found in database: ${fileId}`);
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        const file = rows[0];
        console.log(`📄 File found: ${file.document_name} (${file.document_type})`);
        
        // Extract S3 key
        const s3Key = extractS3Key(file);
        
        if (s3Key) {
            // File is in S3, generate pre-signed URL
            try {
                const expiresIn = 3600; // 1 hour
                const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
                
                const getObjectCommand = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    ResponseContentDisposition: `inline; filename="${encodeURIComponent(file.document_name)}"`,
                    ResponseContentType: file.mime_type || 'application/octet-stream'
                });
                
                const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn });
                
                console.log(`✅ Generated pre-signed URL for file: ${fileId}`);
                
                return res.json({
                    success: true,
                    url: signedUrl,
                    expiresAt: expiresAt,
                    fileName: file.document_name,
                    mimeType: file.mime_type,
                    isS3: true
                });
            } catch (s3Error) {
                console.error('Error generating pre-signed URL:', s3Error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to generate file URL'
                });
            }
        } else {
            // Fallback: Check if file exists on disk (for old files not yet migrated)
            if (fs.existsSync(file.file_path)) {
                console.log(`✅ Serving file from disk: ${file.file_path}`);
                
                // Set appropriate headers
                res.setHeader('Content-Type', file.mime_type);
                res.setHeader('Content-Disposition', `inline; filename="${file.document_name}"`);
                res.setHeader('Content-Length', file.file_size);
                
                // Stream the file
                const fileStream = fs.createReadStream(file.file_path);
                fileStream.pipe(res);
                
                fileStream.on('error', (error) => {
                    console.error('Error streaming file:', error);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            message: 'Error reading file'
                        });
                    }
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }
        }
        
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
