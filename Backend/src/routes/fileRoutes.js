const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

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

// Serve files endpoint
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
        
        // Check if file exists on disk
        if (!fs.existsSync(file.file_path)) {
            console.log(`❌ File not found on disk: ${file.file_path}`);
            return res.status(404).json({
                success: false,
                message: 'File not found on disk'
            });
        }
        
        console.log(`✅ Serving file: ${file.file_path}`);
        
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
        
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
