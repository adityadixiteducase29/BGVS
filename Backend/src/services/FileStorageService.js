const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

class FileStorageService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../../uploads');
        this.ensureUploadDir();
    }

    // Ensure upload directory exists
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

    // Save file to disk
    async saveFile(file, applicationId) {
        try {
            const fileName = this.generateFileName(file.originalname, applicationId);
            const filePath = path.join(this.uploadDir, fileName);
            
            // Write file buffer to disk
            fs.writeFileSync(filePath, file.buffer);
            
            return {
                fileName,
                filePath,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            };
        } catch (error) {
            console.error('Error saving file:', error);
            throw new Error('Failed to save file');
        }
    }

    // Save file information to database
    async saveFileToDatabase(fileInfo, applicationId, documentType) {
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
        } catch (error) {
            console.error('Error saving file to database:', error);
            throw new Error('Failed to save file information to database');
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
                    mimeType: fileInfo.mimeType
                });
                
                console.log(`File saved: ${file.fieldname} -> ${fileInfo.fileName}`);
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

    // Delete file from disk and database
    async deleteFile(documentId) {
        try {
            // Get file info from database
            const [rows] = await pool.execute(
                `SELECT file_path FROM application_documents WHERE id = ?`,
                [documentId]
            );
            
            if (rows.length === 0) {
                throw new Error('File not found in database');
            }
            
            const filePath = rows[0].file_path;
            
            // Delete file from disk
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Delete record from database
            await pool.execute(
                `DELETE FROM application_documents WHERE id = ?`,
                [documentId]
            );
            
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw new Error('Failed to delete file');
        }
    }

    // Delete file by path (for bulk deletion)
    async deleteFileByPath(filePath) {
        try {
            // Delete file from disk
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Successfully deleted file: ${filePath}`);
                return true;
            } else {
                console.log(`File not found on disk: ${filePath}`);
                return false;
            }
        } catch (error) {
            console.error('Error deleting file by path:', error);
            throw new Error('Failed to delete file');
        }
    }
}

module.exports = FileStorageService;
