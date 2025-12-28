const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const { s3Client, BUCKET_NAME } = require('../config/s3');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

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

    // Generate S3 key (path in S3)
    generateS3Key(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        // Get environment identifier to prevent conflicts between dev/prod
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'production' : 'development';
        // S3 key: development/applications/{applicationId}/{filename}
        return `${envPrefix}/applications/${applicationId}/${fileName}`;
    }

    // Generate S3 key for reports (separate folder)
    generateReportS3Key(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'production' : 'development';
        // S3 key: development/applications/{applicationId}/reports/{filename}
        return `${envPrefix}/applications/${applicationId}/reports/${fileName}`;
    }

    // Save file to S3
    async saveFile(file, applicationId) {
        try {
            const s3Key = this.generateS3Key(file.originalname, applicationId);
            
            // Upload to S3
            const uploadCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    'original-name': file.originalname,
                    'application-id': applicationId.toString()
                }
            });

            await s3Client.send(uploadCommand);

            // Generate S3 URL (public URL - we'll use pre-signed URLs for access)
            const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
            
            return {
                fileName: path.basename(file.originalname),
                filePath: s3Url, // S3 URL stored in database
                s3Key: s3Key, // S3 key for deletion
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error('Error saving file to S3:', error);
            throw new Error('Failed to save file to S3');
        }
    }

    // Save file information to database
    async saveFileToDatabase(fileInfo, applicationId, documentType) {
        try {
            // Try with s3_key first (for newer databases), fallback to cloudinary_public_id for backward compatibility
            const [result] = await pool.execute(
                `INSERT INTO application_documents 
                (application_id, document_type, document_name, file_path, file_size, mime_type, cloudinary_public_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicationId,
                    documentType,
                    fileInfo.originalName,
                    fileInfo.filePath, // S3 URL stored here
                    fileInfo.size,
                    fileInfo.mimeType,
                    fileInfo.s3Key || null // Store S3 key in cloudinary_public_id column for backward compatibility
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
                // Save file to S3
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
                    url: fileInfo.filePath // S3 URL
                });
                
                console.log(`File saved to S3: ${file.fieldname} -> ${fileInfo.filePath}`);
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

    // Extract S3 key from file path or database
    extractS3Key(file) {
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

    // Delete file from S3 and database
    async deleteFile(documentId) {
        try {
            // Validate documentId
            if (!documentId || isNaN(parseInt(documentId))) {
                throw new Error('Invalid document ID');
            }

            const docId = parseInt(documentId);
            
            // Get file info from database
            let rows;
            let file;
            
            try {
                [rows] = await pool.execute(
                    `SELECT file_path, cloudinary_public_id FROM application_documents WHERE id = ?`,
                    [docId]
                );
                if (rows.length > 0) {
                    file = rows[0];
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
                    }
                } else {
                    throw error;
                }
            }
            
            if (!rows || rows.length === 0) {
                console.log(`Document with ID ${docId} not found in database`);
                return false;
            }
            
            // Extract S3 key
            const s3Key = this.extractS3Key(file);
            
            // Delete from S3 if key exists
            if (s3Key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: s3Key
                    });
                    
                    await s3Client.send(deleteCommand);
                    console.log(`File deleted from S3: ${s3Key}`);
                } catch (s3Error) {
                    console.error('Error deleting from S3:', s3Error);
                    // Continue with database deletion even if S3 deletion fails
                }
            } else if (file.file_path && !file.file_path.includes('.amazonaws.com') && !file.file_path.startsWith('development/') && !file.file_path.startsWith('production/')) {
                // Fallback: Delete from local disk if not in S3 (for old files)
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
            // Check if it's an S3 URL or key
            let s3Key = null;
            
            if (filePath && filePath.includes('.amazonaws.com/')) {
                // Extract key from S3 URL
                const urlParts = filePath.split('.amazonaws.com/');
                if (urlParts.length > 1) {
                    s3Key = urlParts[1];
                }
            } else if (filePath && (filePath.startsWith('development/') || filePath.startsWith('production/'))) {
                // It's already an S3 key
                s3Key = filePath;
            } else {
                // Try to get from database
                const [rows] = await pool.execute(
                    `SELECT cloudinary_public_id FROM application_documents WHERE file_path = ?`,
                    [filePath]
                );
                
                if (rows.length > 0 && rows[0].cloudinary_public_id) {
                    s3Key = rows[0].cloudinary_public_id;
                }
            }
            
            if (s3Key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: s3Key
                    });
                    
                    await s3Client.send(deleteCommand);
                    console.log(`Successfully deleted file from S3: ${s3Key}`);
                    return true;
                } catch (s3Error) {
                    console.error('Error deleting from S3:', s3Error);
                    return false;
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

    // ============================================================================
    // REPORT METHODS
    // ============================================================================

    // Generate S3 key for reports (separate folder)
    generateReportS3Key(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'production' : 'development';
        // S3 key: development/applications/{applicationId}/reports/{filename}
        return `${envPrefix}/applications/${applicationId}/reports/${fileName}`;
    }

    // Save report file to S3
    async saveReport(file, applicationId) {
        try {
            const s3Key = this.generateReportS3Key(file.originalname, applicationId);
            
            // Upload to S3
            const uploadCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    'original-name': file.originalname,
                    'application-id': applicationId.toString(),
                    'file-type': 'report'
                }
            });

            await s3Client.send(uploadCommand);

            // Generate S3 URL
            const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
            
            return {
                fileName: path.basename(file.originalname),
                filePath: s3Url,
                s3Key: s3Key,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error('Error saving report to S3:', error);
            throw new Error('Failed to save report to S3');
        }
    }

    // Save report information to database
    async saveReportToDatabase(fileInfo, applicationId, uploadedBy) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO application_reports 
                (application_id, report_name, file_path, s3_key, file_size, mime_type, uploaded_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicationId,
                    fileInfo.originalName,
                    fileInfo.filePath,
                    fileInfo.s3Key,
                    fileInfo.size,
                    fileInfo.mimeType,
                    uploadedBy
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error saving report to database:', error);
            throw new Error(`Failed to save report information to database: ${error.message}`);
        }
    }

    // Get reports for an application
    async getApplicationReports(applicationId) {
        try {
            const [rows] = await pool.execute(
                `SELECT r.*, u.first_name, u.last_name, u.email as uploaded_by_email
                 FROM application_reports r
                 LEFT JOIN users u ON r.uploaded_by = u.id
                 WHERE r.application_id = ? 
                 ORDER BY r.uploaded_at DESC`,
                [applicationId]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching application reports:', error);
            throw new Error('Failed to fetch application reports');
        }
    }

    // Delete report from S3 and database
    async deleteReport(reportId) {
        try {
            if (!reportId || isNaN(parseInt(reportId))) {
                throw new Error('Invalid report ID');
            }

            const docId = parseInt(reportId);
            
            // Get report info from database
            const [rows] = await pool.execute(
                `SELECT file_path, s3_key FROM application_reports WHERE id = ?`,
                [docId]
            );
            
            if (rows.length === 0) {
                console.log(`Report with ID ${docId} not found in database`);
                return false;
            }
            
            const report = rows[0];
            let s3Key = report.s3_key;
            
            // If s3_key is not in database, try to extract from file_path
            if (!s3Key && report.file_path) {
                s3Key = this.extractS3Key({ file_path: report.file_path });
            }
            
            // Delete from S3 if key exists
            if (s3Key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: s3Key
                    });
                    
                    await s3Client.send(deleteCommand);
                    console.log(`Report deleted from S3: ${s3Key}`);
                } catch (s3Error) {
                    console.error('Error deleting report from S3:', s3Error);
                    // Continue with database deletion even if S3 deletion fails
                }
            }
            
            // Delete record from database
            const [deleteResult] = await pool.execute(
                `DELETE FROM application_reports WHERE id = ?`,
                [docId]
            );
            
            if (deleteResult.affectedRows === 0) {
                console.log(`No report deleted from database for ID: ${docId}`);
                return false;
            }
            
            console.log(`Report ${docId} deleted successfully`);
            return true;
        } catch (error) {
            console.error('Error deleting report:', error);
            throw new Error(`Failed to delete report: ${error.message}`);
        }
    }
}

module.exports = FileStorageService;
