const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const cloudinary = require('../config/cloudinary');

class FileStorageService {
    constructor() {
        // Keep uploadDir for backward compatibility (files not yet migrated)
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.ensureUploadDir();
    }

    // Ensure upload directory exists (for backward compatibility)
    ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // Generate unique filename
    generateFileName(originalName, applicationId) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);
        return `${applicationId}_${baseName}_${timestamp}_${randomString}${extension}`;
    }

    // Generate Cloudinary public_id (path in Cloudinary)
    generatePublicId(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        // Get environment identifier to prevent conflicts between dev/prod
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'prod' : 'dev';
        // Remove extension for public_id (Cloudinary handles it)
        const publicId = `${envPrefix}/applications/${applicationId}/${path.basename(fileName, path.extname(fileName))}`;
        return publicId;
    }

    // Save file to Cloudinary
    async saveFile(file, applicationId) {
        try {
            const publicId = this.generatePublicId(file.originalname, applicationId);
            
            // Determine resource type
            const resourceType = file.mimetype?.startsWith('image/') ? 'image' : 
                               file.mimetype?.startsWith('video/') ? 'video' : 'raw';
            
            // Get environment identifier (dev/prod) to prevent folder conflicts
            const env = process.env.NODE_ENV || 'development';
            const envPrefix = env === 'production' ? 'prod' : 'dev';
            
            // Upload to Cloudinary with environment prefix to prevent conflicts between dev/prod
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: resourceType,
                        public_id: publicId,
                        folder: `${envPrefix}/applications/${applicationId}`, // Organize by environment and application
                        use_filename: false,
                        unique_filename: true,
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                
                // Upload the buffer
                uploadStream.end(file.buffer);
            });

            // Determine mime type correctly for different resource types
            let mimeType = file.mimetype;
            if (uploadResult.format) {
                if (resourceType === 'image') {
                    mimeType = `image/${uploadResult.format}`;
                } else if (resourceType === 'raw') {
                    // For PDFs and other raw files, keep original mimetype
                    mimeType = file.mimetype || `application/${uploadResult.format}`;
                }
            }
            
            return {
                fileName: path.basename(uploadResult.original_filename || file.originalname),
                filePath: uploadResult.secure_url, // Cloudinary URL
                cloudinaryPublicId: uploadResult.public_id,
                originalName: file.originalname,
                size: uploadResult.bytes || file.size,
                mimeType: mimeType
            };
        } catch (error) {
            console.error('Error saving file to Cloudinary:', error);
            throw new Error('Failed to save file to Cloudinary');
        }
    }

    // Save file information to database
    async saveFileToDatabase(fileInfo, applicationId, documentType) {
        try {
            // Try with cloudinary_public_id first (for newer databases)
            const [result] = await pool.execute(
                `INSERT INTO application_documents 
                (application_id, document_type, document_name, file_path, file_size, mime_type, cloudinary_public_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicationId,
                    documentType,
                    fileInfo.originalName,
                    fileInfo.filePath, // Cloudinary URL stored here
                    fileInfo.size,
                    fileInfo.mimeType,
                    fileInfo.cloudinaryPublicId || null
                ]
            );
            return result.insertId;
        } catch (error) {
            // If cloudinary_public_id column doesn't exist, try without it
            if (error.message.includes('cloudinary_public_id')) {
                try {
                    const [result] = await pool.execute(
                        `INSERT INTO application_documents 
                        (application_id, document_type, document_name, file_path, file_size, mime_type) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            applicationId,
                            documentType,
                            fileInfo.originalName,
                            fileInfo.filePath,
                            fileInfo.size,
                            fileInfo.mimeType
                        ]
                    );
                    return result.insertId;
                } catch (innerError) {
                    console.error('Error saving file to database (without cloudinary_public_id):', innerError);
                    throw new Error(`Failed to save file information to database: ${innerError.message}`);
                }
            }
            
            // Check if it's an ENUM constraint violation (document_type issue)
            if (error.message.includes('document_type') || 
                error.message.includes('Data truncated') || 
                error.message.includes('Invalid enum value')) {
                console.error('❌ ENUM constraint violation for document_type:', documentType);
                console.error('   This usually means the document_type column is still an ENUM.');
                console.error('   Please run migration_fix_application_documents.sql to change it to VARCHAR.');
                throw new Error(`Document type '${documentType}' is not allowed. Please run migration_fix_application_documents.sql to fix the table structure.`);
            }
            
            console.error('Error saving file to database:', error);
            console.error('Error details:', {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage
            });
            throw new Error(`Failed to save file information to database: ${error.message}`);
        }
    }

    // Map file field names to document types
    getDocumentType(fieldName) {
        // Return the field name as the document type to preserve specificity
        // This allows the frontend to identify exactly which document it is
        return fieldName;
    }

    // Process all uploaded files
    async processFiles(files, applicationId) {
        const savedFiles = [];
        
        for (const file of files) {
            try {
                // Save file to disk
                const fileInfo = await this.saveFile(file, applicationId);
                
                // Determine document type
                const documentType = this.getDocumentType(file.fieldname);
                
                // Save file info to database
                const documentId = await this.saveFileToDatabase(fileInfo, applicationId, documentType);
                
                savedFiles.push({
                    id: documentId,
                    fieldName: file.fieldname,
                    originalName: fileInfo.originalName,
                    fileName: fileInfo.fileName,
                    documentType,
                    size: fileInfo.size,
                    mimeType: fileInfo.mimeType,
                    url: fileInfo.filePath // Cloudinary URL
                });
                
                console.log(`File saved to Cloudinary: ${file.fieldname} -> ${fileInfo.filePath}`);
            } catch (error) {
                console.error(`Error processing file ${file.fieldname}:`, error);
                // Continue processing other files even if one fails
            }
        }
        
        return savedFiles;
    }

    // Get files for an application
    async getApplicationFiles(applicationId) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM application_documents WHERE application_id = ? ORDER BY uploaded_at ASC`,
                [applicationId]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching application files:', error);
            throw new Error('Failed to fetch application files');
        }
    }

    // Delete file from Cloudinary and database
    async deleteFile(documentId) {
        try {
            // Validate documentId
            if (!documentId || isNaN(parseInt(documentId))) {
                throw new Error('Invalid document ID');
            }

            const docId = parseInt(documentId);
            
            // Get file info from database
            // Try with cloudinary_public_id first, fallback to just file_path if column doesn't exist
            let rows;
            let file;
            let publicId = null;
            
            try {
                [rows] = await pool.execute(
                    `SELECT file_path, cloudinary_public_id FROM application_documents WHERE id = ?`,
                    [docId]
                );
                if (rows.length > 0) {
                    file = rows[0];
                    publicId = file.cloudinary_public_id || null;
                }
            } catch (error) {
                // If cloudinary_public_id column doesn't exist, try without it
                if (error.message.includes('cloudinary_public_id')) {
                    [rows] = await pool.execute(
                        `SELECT file_path FROM application_documents WHERE id = ?`,
                        [docId]
                    );
                    if (rows.length > 0) {
                        file = rows[0];
                        publicId = null;
                    }
                } else {
                    throw error;
                }
            }
            
            if (!rows || rows.length === 0) {
                console.log(`Document with ID ${docId} not found in database`);
                return false;
            }
            
            // If publicId is not in database but file_path is a Cloudinary URL, extract it
            if (!publicId && file.file_path && file.file_path.includes('cloudinary.com')) {
                try {
                    // Extract public_id from Cloudinary URL
                    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
                    const urlParts = file.file_path.split('/');
                    const uploadIndex = urlParts.findIndex(part => part === 'upload');
                    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                        const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
                        publicId = pathAfterVersion.replace(/\.[^/.]+$/, ''); // Remove file extension
                        console.log(`Extracted public_id from URL: ${publicId}`);
                    }
                } catch (extractError) {
                    console.error('Error extracting public_id from URL:', extractError);
                }
            }
            
            // Delete from Cloudinary if public_id exists
            if (publicId) {
                try {
                    // Determine resource type
                    const resourceType = file.file_path?.includes('/image/') ? 'image' : 
                                       file.file_path?.includes('/video/') ? 'video' : 'raw';
                    
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: resourceType
                    });
                    console.log(`File deleted from Cloudinary: ${publicId}`);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                    // Continue with database deletion even if Cloudinary deletion fails
                }
            } else if (file.file_path && !file.file_path.includes('cloudinary.com')) {
                // Fallback: Delete from local disk if not in Cloudinary
                try {
                    if (fs.existsSync(file.file_path)) {
                        fs.unlinkSync(file.file_path);
                        console.log(`File deleted from local disk: ${file.file_path}`);
                    } else {
                        console.log(`File not found on local disk: ${file.file_path}`);
                    }
                } catch (fsError) {
                    console.error('Error deleting file from local disk:', fsError);
                    // Continue with database deletion even if file deletion fails
                }
            }
            
            // Delete record from database
            const [deleteResult] = await pool.execute(
                `DELETE FROM application_documents WHERE id = ?`,
                [docId]
            );
            
            if (deleteResult.affectedRows === 0) {
                console.log(`No document deleted from database for ID: ${docId}`);
                return false;
            }
            
            console.log(`Document ${docId} deleted successfully`);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    // Delete file by path (for bulk deletion)
    async deleteFileByPath(filePath) {
        try {
            // Check if it's a Cloudinary URL
            if (filePath && filePath.includes('cloudinary.com')) {
                // Try to get public_id from database
                const [rows] = await pool.execute(
                    `SELECT cloudinary_public_id FROM application_documents WHERE file_path = ?`,
                    [filePath]
                );
                
                if (rows.length > 0 && rows[0].cloudinary_public_id) {
                    const publicId = rows[0].cloudinary_public_id;
                    try {
                        const resourceType = filePath.includes('/image/') ? 'image' : 
                                           filePath.includes('/video/') ? 'video' : 'raw';
                        
                        await cloudinary.uploader.destroy(publicId, {
                            resource_type: resourceType
                        });
                        console.log(`Successfully deleted file from Cloudinary: ${publicId}`);
                        return true;
                    } catch (cloudinaryError) {
                        console.error('Error deleting from Cloudinary:', cloudinaryError);
                        return false;
                    }
                } else {
                    // Try to extract public_id from URL
                    const urlParts = filePath.split('/');
                    const uploadIndex = urlParts.findIndex(part => part === 'upload');
                    if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
                        const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
                        const publicId = pathAfterVersion.replace(/\.[^/.]+$/, '');
                        
                        try {
                            const resourceType = filePath.includes('/image/') ? 'image' : 
                                               filePath.includes('/video/') ? 'video' : 'raw';
                            
                            await cloudinary.uploader.destroy(publicId, {
                                resource_type: resourceType
                            });
                            console.log(`Successfully deleted file from Cloudinary: ${publicId}`);
                            return true;
                        } catch (cloudinaryError) {
                            console.error('Error deleting from Cloudinary:', cloudinaryError);
                            return false;
                        }
                    }
                }
            } else {
                // Fallback: Delete from local disk
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Successfully deleted file from disk: ${filePath}`);
                    return true;
                } else {
                    console.log(`File not found: ${filePath}`);
                    return false;
                }
            }
        } catch (error) {
            console.error('Error deleting file by path:', error);
            throw new Error('Failed to delete file');
        }
    }
}

module.exports = FileStorageService;
