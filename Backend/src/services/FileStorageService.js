const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const StorageFactory = require('./storage/StorageFactory');

class FileStorageService {
    constructor() {
        // Keep uploadDir for backward compatibility (files not yet migrated)
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.ensureUploadDir();
        
        // Get storage provider based on configuration
        this.storageProvider = StorageFactory.getStorageProvider();
        
        // Log current storage provider
        console.log(`📦 Using storage provider: ${this.storageProvider.getProviderName()}`);
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

    // Generate storage key (path in storage - works for both AWS S3 and DigitalOcean Spaces)
    generateStorageKey(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        // Get environment identifier to prevent conflicts between dev/prod
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'production' : 'development';
        // Storage key: development/applications/{applicationId}/{filename}
        return `${envPrefix}/applications/${applicationId}/${fileName}`;
    }

    // Generate storage key for reports (separate folder)
    generateReportStorageKey(originalName, applicationId) {
        const fileName = this.generateFileName(originalName, applicationId);
        const env = process.env.NODE_ENV || 'development';
        const envPrefix = env === 'production' ? 'production' : 'development';
        // Storage key: development/applications/{applicationId}/reports/{filename}
        return `${envPrefix}/applications/${applicationId}/reports/${fileName}`;
    }

    // Legacy method names for backward compatibility
    generateS3Key(originalName, applicationId) {
        return this.generateStorageKey(originalName, applicationId);
    }

    generateReportS3Key(originalName, applicationId) {
        return this.generateReportStorageKey(originalName, applicationId);
    }

    // Save file to storage (AWS S3 or DigitalOcean Spaces)
    async saveFile(file, applicationId) {
        try {
            const storageKey = this.generateStorageKey(file.originalname, applicationId);
            
            // Upload to storage provider
            const result = await this.storageProvider.uploadFile(
                file.buffer,
                storageKey,
                file.mimetype,
                {
                    'original-name': file.originalname,
                    'application-id': applicationId.toString()
                }
            );
            
            return {
                fileName: path.basename(file.originalname),
                filePath: result.filePath, // Storage URL stored in database
                s3Key: result.storageKey, // Storage key for deletion (kept as s3Key for backward compatibility)
                storageKey: result.storageKey, // New field name
                storageProvider: result.provider, // Track which provider stored this file
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error(`Error saving file to ${this.storageProvider.getProviderName()}:`, error);
            throw new Error(`Failed to save file to ${this.storageProvider.getProviderName()}`);
        }
    }

    // Save file information to database
    async saveFileToDatabase(fileInfo, applicationId, documentType) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO application_documents 
                (application_id, document_type, document_name, file_path, file_size, mime_type, s3_key) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    applicationId,
                    documentType,
                    fileInfo.originalName,
                    fileInfo.filePath, // S3 URL stored here
                    fileInfo.size,
                    fileInfo.mimeType,
                    fileInfo.s3Key || null // Store S3 key
                ]
            );
            return result.insertId;
        } catch (error) {
            // If s3_key column doesn't exist, try without it (for older databases)
            if (error.message.includes('s3_key')) {
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
                    console.error('Error saving file to database (without s3_key):', innerError);
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
                
                console.log(`File saved to ${fileInfo.storageProvider || this.storageProvider.getProviderName()}: ${file.fieldname} -> ${fileInfo.filePath}`);
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

    // Extract storage key from file path or database
    // Works with both AWS S3 and DigitalOcean Spaces URLs
    extractStorageKey(file) {
        // First try to get from s3_key column (backward compatibility)
        if (file.s3_key) {
            return file.s3_key;
        }
        
        // Try to get from storage_key column (new field)
        if (file.storage_key) {
            return file.storage_key;
        }
        
        // If file_path exists, try to extract key using the appropriate provider
        if (file.file_path) {
            // Get provider for this file (could be AWS or DO)
            const provider = StorageFactory.getProviderForFile(file.file_path);
            if (provider) {
                const key = provider.extractKeyFromUrl(file.file_path);
                if (key) return key;
            }
        }
        
        // If file_path is just the storage key (without full URL)
        if (file.file_path && (file.file_path.startsWith('development/') || file.file_path.startsWith('production/'))) {
            return file.file_path;
        }
        
        return null;
    }

    // Legacy method name for backward compatibility
    extractS3Key(file) {
        return this.extractStorageKey(file);
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
                    `SELECT file_path, s3_key FROM application_documents WHERE id = ?`,
                    [docId]
                );
                if (rows.length > 0) {
                    file = rows[0];
                }
            } catch (error) {
                // If s3_key column doesn't exist, try without it (for older databases)
                if (error.message.includes('s3_key')) {
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
            
            // Extract storage key
            const storageKey = this.extractStorageKey(file);
            
            // Delete from storage if key exists
            if (storageKey) {
                try {
                    // Get the appropriate provider for this file (could be AWS or DO)
                    const provider = StorageFactory.getProviderForFile(file.file_path) || this.storageProvider;
                    await provider.deleteFile(storageKey);
                    console.log(`File deleted from ${provider.getProviderName()}: ${storageKey}`);
                } catch (storageError) {
                    console.error(`Error deleting from storage:`, storageError);
                    // Continue with database deletion even if storage deletion fails
                }
            } else if (file.file_path && !file.file_path.includes('.amazonaws.com') && !file.file_path.includes('.digitaloceanspaces.com') && !file.file_path.startsWith('development/') && !file.file_path.startsWith('production/')) {
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
            // Get the appropriate provider for this file
            const provider = StorageFactory.getProviderForFile(filePath) || this.storageProvider;
            const storageKey = provider.extractKeyFromUrl(filePath);
            
            let keyToDelete = storageKey;
            
            if (!keyToDelete && filePath) {
                // Try to get from database
                const [rows] = await pool.execute(
                    `SELECT s3_key, storage_key FROM application_documents WHERE file_path = ?`,
                    [filePath]
                );
                
                if (rows.length > 0) {
                    keyToDelete = rows[0].storage_key || rows[0].s3_key;
                }
            }
            
            if (keyToDelete) {
                try {
                    await provider.deleteFile(keyToDelete);
                    console.log(`Successfully deleted file from ${provider.getProviderName()}: ${keyToDelete}`);
                    return true;
                } catch (storageError) {
                    console.error(`Error deleting from ${provider.getProviderName()}:`, storageError);
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

    // Save report file to storage (AWS S3 or DigitalOcean Spaces)
    async saveReport(file, applicationId) {
        try {
            const storageKey = this.generateReportStorageKey(file.originalname, applicationId);
            
            // Upload to storage provider
            const result = await this.storageProvider.uploadFile(
                file.buffer,
                storageKey,
                file.mimetype,
                {
                    'original-name': file.originalname,
                    'application-id': applicationId.toString(),
                    'file-type': 'report'
                }
            );
            
            return {
                fileName: path.basename(file.originalname),
                filePath: result.filePath,
                s3Key: result.storageKey, // Backward compatibility
                storageKey: result.storageKey,
                storageProvider: result.provider,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error(`Error saving report to ${this.storageProvider.getProviderName()}:`, error);
            throw new Error(`Failed to save report to ${this.storageProvider.getProviderName()}`);
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
            let storageKey = report.storage_key || report.s3_key;
            
            // If storage key is not in database, try to extract from file_path
            if (!storageKey && report.file_path) {
                storageKey = this.extractStorageKey({ file_path: report.file_path });
            }
            
            // Delete from storage if key exists
            if (storageKey) {
                try {
                    // Get the appropriate provider for this file
                    const provider = StorageFactory.getProviderForFile(report.file_path) || this.storageProvider;
                    await provider.deleteFile(storageKey);
                    console.log(`Report deleted from ${provider.getProviderName()}: ${storageKey}`);
                } catch (storageError) {
                    console.error(`Error deleting report from storage:`, storageError);
                    // Continue with database deletion even if storage deletion fails
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
