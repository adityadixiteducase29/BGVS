const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const StorageProvider = require('./StorageProvider');

/**
 * DigitalOcean Spaces Storage Provider
 * Implements storage operations for DigitalOcean Spaces (S3-compatible)
 */
class DigitalOceanSpacesProvider extends StorageProvider {
    constructor(config) {
        super();
        this.config = config;
        this.bucketName = config.bucketName || process.env.DO_SPACES_BUCKET_NAME;
        this.region = config.region || process.env.DO_SPACES_REGION || 'nyc3';
        this.endpoint = config.endpoint || `https://${this.region}.digitaloceanspaces.com`;
        
        // DigitalOcean Spaces uses S3-compatible API
        this.client = new S3Client({
            region: this.region,
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId || process.env.DO_SPACES_ACCESS_KEY,
                secretAccessKey: config.secretAccessKey || process.env.DO_SPACES_SECRET_KEY
            },
            // DigitalOcean Spaces uses virtual-hosted-style URLs (not path-style)
            forcePathStyle: false
        });

        if (!this.bucketName || !this.region) {
            console.warn('⚠️  DigitalOcean Spaces configuration incomplete. Some operations may fail.');
        }
    }

    async uploadFile(buffer, key, contentType, metadata = {}) {
        try {
            const uploadCommand = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                Metadata: metadata,
                ACL: 'private' // DigitalOcean Spaces: use private ACL, access via pre-signed URLs
            });

            await this.client.send(uploadCommand);

            const filePath = this.getPublicUrl(key);

            return {
                filePath,
                storageKey: key,
                provider: 'digitalocean'
            };
        } catch (error) {
            console.error('Error uploading file to DigitalOcean Spaces:', error);
            throw new Error(`Failed to upload file to DigitalOcean Spaces: ${error.message}`);
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
            console.error('Error deleting file from DigitalOcean Spaces:', error);
            throw new Error(`Failed to delete file from DigitalOcean Spaces: ${error.message}`);
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
            console.error('Error generating DigitalOcean Spaces pre-signed URL:', error);
            throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
        }
    }

    getPublicUrl(key) {
        // DigitalOcean Spaces public URL format
        // Note: This is the base URL. For private files, use pre-signed URLs
        return `https://${this.bucketName}.${this.region}.digitaloceanspaces.com/${key}`;
    }

    extractKeyFromUrl(url) {
        if (!url) return null;
        
        // Extract key from DigitalOcean Spaces URL
        // Format: https://bucket-name.region.digitaloceanspaces.com/key
        const match = url.match(/https?:\/\/[^\/]+\.digitaloceanspaces\.com\/(.+)$/);
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
        return url.includes('.digitaloceanspaces.com') || 
               (url.startsWith('development/') || url.startsWith('production/'));
    }

    getProviderName() {
        return 'digitalocean';
    }
}

module.exports = DigitalOceanSpacesProvider;
