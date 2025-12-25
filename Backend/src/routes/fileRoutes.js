const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const cloudinary = require('../config/cloudinary');

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

// Helper function to extract public_id from Cloudinary URL
function extractPublicIdFromUrl(url) {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    // URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
        // Get everything after the version number
        const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return pathAfterVersion.replace(/\.[^/.]+$/, '');
    }
    
    return null;
}

// ============================================================================
// NEW: Get presigned URL (bypasses backend for downloads)
// ============================================================================
router.get('/:fileId/presigned-url', authenticateFileAccess, async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log(`🔐 Presigned URL request: ${fileId} from user: ${req.user.email}`);
        
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
        
        // Check if file is in Cloudinary
        if (!file.file_path || !file.file_path.includes('cloudinary.com')) {
            console.log(`⚠️  File not in Cloudinary, returning direct URL: ${file.file_path}`);
            // If not in Cloudinary yet, return the file_path directly (for backward compatibility)
            return res.json({
                success: true,
                url: file.file_path,
                expiresAt: null,
                fileName: file.document_name,
                mimeType: file.mime_type,
                isCloudinary: false
            });
        }
        
        // Extract public_id from database or URL
        const publicId = file.cloudinary_public_id || extractPublicIdFromUrl(file.file_path);
        
        if (!publicId) {
            console.error(`❌ Could not extract public_id from file: ${fileId}`);
            return res.status(500).json({
                success: false,
                message: 'Could not generate presigned URL'
            });
        }
        
        // Determine resource type
        const resourceType = file.mime_type?.startsWith('image/') ? 'image' : 
                           file.mime_type?.startsWith('video/') ? 'video' : 'raw';
        
        // Generate presigned URL (expires in 1 hour)
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        
        // Cloudinary signed URL (their version of presigned URL)
        const signedUrl = cloudinary.utils.private_download_url(publicId, {
            resource_type: resourceType,
            expires_at: expiresAt,
            attachment: false, // Set to true if you want to force download
            filename: file.document_name
        });
        
        console.log(`✅ Generated presigned URL for file: ${fileId}`);
        
        return res.json({
            success: true,
            url: signedUrl,
            expiresAt: expiresAt,
            fileName: file.document_name,
            mimeType: file.mime_type,
            isCloudinary: true
        });
        
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ============================================================================
// NEW: Proxy endpoint for PDFs (bypasses CORS issues)
// ============================================================================
router.get('/:fileId/proxy', authenticateFileAccess, async (req, res) => {
    try {
        const { fileId } = req.params;
        console.log(`🔄 Proxy request: ${fileId} from user: ${req.user.email}`);
        
        // Get file information from database
        const [rows] = await pool.execute(
            `SELECT * FROM application_documents WHERE id = ?`,
            [fileId]
        );
        
        if (rows.length === 0) {
            console.error(`❌ File not found in database: ${fileId}`);
            return res.status(404).json({
                success: false,
                message: 'File not found in database'
            });
        }
        
        const file = rows[0];
        console.log(`📄 File found: ${file.document_name}, path: ${file.file_path}`);
        
        // Check if file_path exists
        if (!file.file_path) {
            console.error(`❌ File path is null for file: ${fileId}`);
            return res.status(404).json({
                success: false,
                message: 'File path not found'
            });
        }
        
        // Only proxy Cloudinary files
        if (file.file_path.includes('cloudinary.com')) {
            console.log(`📥 Proxying Cloudinary file: ${file.file_path}`);
            
            try {
                // Fetch from Cloudinary
                const cloudinaryResponse = await fetch(file.file_path, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0'
                    }
                });
                
                console.log(`📥 Cloudinary response status: ${cloudinaryResponse.status}`);
                
                if (!cloudinaryResponse.ok) {
                    const errorText = await cloudinaryResponse.text();
                    console.error(`❌ Cloudinary fetch failed: ${cloudinaryResponse.status} - ${errorText.substring(0, 100)}`);
                    return res.status(cloudinaryResponse.status).json({
                        success: false,
                        message: `Failed to fetch file from Cloudinary: ${cloudinaryResponse.status}`
                    });
                }
                
                // Get the file buffer - ensure we get the complete response
                const buffer = await cloudinaryResponse.arrayBuffer();
                console.log(`✅ Received ${buffer.byteLength} bytes from Cloudinary`);
                
                // Validate it's actually a PDF by checking first bytes
                const uint8Array = new Uint8Array(buffer);
                const headerBytes = uint8Array.slice(0, 4);
                const header = String.fromCharCode.apply(null, Array.from(headerBytes));
                
                if (header !== '%PDF') {
                    console.error(`❌ Invalid PDF structure from Cloudinary. Header: ${header}`);
                    console.error('First 20 bytes:', Array.from(uint8Array.slice(0, 20)).map(b => String.fromCharCode(b)).join(''));
                    console.error('First 20 bytes (hex):', Array.from(uint8Array.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));
                    
                    // Check if it's an HTML error page from Cloudinary
                    const textStart = String.fromCharCode.apply(null, Array.from(uint8Array.slice(0, 100)));
                    if (textStart.includes('<html') || textStart.includes('<!DOCTYPE')) {
                        console.error('❌ Cloudinary returned HTML error page instead of PDF');
                        return res.status(500).json({
                            success: false,
                            message: 'Cloudinary returned an error page instead of the PDF file'
                        });
                    }
                    
                    // Still send it - might be a valid file with different header
                    console.warn('⚠️ Proceeding despite invalid header - might be valid file');
                } else {
                    console.log(`✅ Valid PDF structure confirmed (starts with %PDF)`);
                }
                
                // Ensure buffer is not empty
                if (buffer.byteLength === 0) {
                    console.error('❌ Received empty buffer from Cloudinary');
                    return res.status(500).json({
                        success: false,
                        message: 'Received empty file from Cloudinary'
                    });
                }
                
                // Set appropriate headers - IMPORTANT: Set Content-Type BEFORE sending
                res.setHeader('Content-Type', file.mime_type || 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.document_name)}"`);
                res.setHeader('Content-Length', buffer.byteLength);
                res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
                res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for proxy
                res.setHeader('Access-Control-Allow-Methods', 'GET');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                res.setHeader('Accept-Ranges', 'bytes'); // Support range requests for PDF.js
                
                // Convert to Node.js Buffer and send
                const nodeBuffer = Buffer.from(buffer);
                res.send(nodeBuffer);
                console.log(`✅ PDF sent successfully: ${nodeBuffer.length} bytes`);
            } catch (fetchError) {
                console.error('❌ Error fetching from Cloudinary:', fetchError);
                console.error('Error details:', {
                    message: fetchError.message,
                    stack: fetchError.stack
                });
                return res.status(500).json({
                    success: false,
                    message: `Failed to proxy file from Cloudinary: ${fetchError.message}`
                });
            }
        } else {
            console.error(`❌ File is not in Cloudinary: ${file.file_path}`);
            // For non-Cloudinary files, try to serve from disk
            if (fs.existsSync(file.file_path)) {
                console.log(`📁 Serving file from disk: ${file.file_path}`);
                res.setHeader('Content-Type', file.mime_type || 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${file.document_name}"`);
                const fileStream = fs.createReadStream(file.file_path);
                fileStream.pipe(res);
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'File not found on server. Proxy only available for Cloudinary files.'
                });
            }
        }
    } catch (error) {
        console.error('❌ Error proxying file:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
});

// ============================================================================
// OLD: Serve files endpoint (kept for backward compatibility)
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
        
        // If file is in Cloudinary, handle differently based on file type
        if (file.file_path && file.file_path.includes('cloudinary.com')) {
            const isPDF = file.mime_type === 'application/pdf' || 
                         file.document_name?.toLowerCase().endsWith('.pdf');
            
            if (isPDF) {
                // For PDFs, we can either return the URL or proxy it
                // Returning URL is better for performance, but may have CORS issues
                // If CORS issues occur, frontend can request /:fileId/proxy endpoint
                console.log(`📄 Returning Cloudinary PDF URL: ${file.file_path}`);
                return res.json({
                    success: true,
                    url: file.file_path,
                    fileName: file.document_name,
                    mimeType: file.mime_type,
                    isCloudinary: true,
                    proxyUrl: `/api/files/${fileId}/proxy` // Provide proxy URL as fallback
                });
            } else {
                // For images, return JSON to avoid CORS issues with credentials
                // Images can be used directly in <img> tags without fetching
                console.log(`🖼️ Returning Cloudinary image URL: ${file.file_path}`);
                return res.json({
                    success: true,
                    url: file.file_path,
                    fileName: file.document_name,
                    mimeType: file.mime_type,
                    isCloudinary: true
                });
            }
        }
        
        // Fallback: Check if file exists on disk (for files not yet migrated)
        if (!fs.existsSync(file.file_path)) {
            console.log(`❌ File not found on disk: ${file.file_path}`);
            return res.status(404).json({
                success: false,
                message: 'File not found on disk'
            });
        }
        
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
        
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
