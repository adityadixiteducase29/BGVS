const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const StorageProvider = require('./StorageProvider');

/**
 * AWS S3 Storage Provider
 * Implements storage operations for AWS S3
 */
class AwsS3Provider extends StorageProvider {
    constructor(config) {
        super();
        this.config = config;
        this.bucketName = config.bucketName || process.env.AWS_S3_BUCKET_NAME;
        this.region = config.region || process.env.AWS_REGION || 'us-east-1';
        
        // Create S3 client
        this.client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        if (!this.bucketName || !this.region) {
            console.warn('⚠️  AWS S3 configuration incomplete. Some operations may fail.');
        }
    }

    async uploadFile(buffer, key, contentType, metadata = {}) {
        try {
            const uploadCommand = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                Metadata: metadata
            });

            await this.client.send(uploadCommand);

            const filePath = this.getPublicUrl(key);

            return {
                filePath,
                storageKey: key,
                provider: 'aws'
            };
        } catch (error) {
            console.error('Error uploading file to AWS S3:', error);
            throw new Error(`Failed to upload file to AWS S3: ${error.message}`);
        }
    }

    async deleteFile(key) {
        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            });

            await this.client.send(deleteCommand);
            return true;
        } catch (error) {
            console.error('Error deleting file from AWS S3:', error);
            throw new Error(`Failed to delete file from AWS S3: ${error.message}`);
        }
    }

    async getSignedUrl(key, expiresIn = 3600, options = {}) {
        try {
            const getObjectCommand = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ResponseContentDisposition: options.filename 
                    ? `inline; filename="${encodeURIComponent(options.filename)}"` 
                    : undefined,
                ResponseContentType: options.contentType || undefined
            });

            const signedUrl = await getSignedUrl(this.client, getObjectCommand, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('Error generating AWS S3 pre-signed URL:', error);
            throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
        }
    }

    getPublicUrl(key) {
        // AWS S3 public URL format
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    }

    extractKeyFromUrl(url) {
        if (!url) return null;
        
        // Extract key from AWS S3 URL
        // Format: https://bucket-name.s3.region.amazonaws.com/key
        const match = url.match(/https?:\/\/[^\/]+\.s3[^\/]*\.amazonaws\.com\/(.+)$/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
        
        // If it's already a key (starts with development/ or production/)
        if (url.startsWith('development/') || url.startsWith('production/')) {
            return url;
        }
        
        return null;
    }

    isProviderUrl(url) {
        if (!url) return false;
        return url.includes('.amazonaws.com') || 
               url.includes('s3.') || 
               (url.startsWith('development/') || url.startsWith('production/'));
    }

    getProviderName() {
        return 'aws';
    }
}

module.exports = AwsS3Provider;
