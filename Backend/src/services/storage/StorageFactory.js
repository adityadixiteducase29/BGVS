const AwsS3Provider = require('./AwsS3Provider');
const DigitalOceanSpacesProvider = require('./DigitalOceanSpacesProvider');
require('dotenv').config();

/**
 * Storage Factory
 * Creates and returns the appropriate storage provider based on configuration
 */
class StorageFactory {
    /**
     * Get the configured storage provider
     * @param {Object} config - Optional configuration override
     * @returns {StorageProvider} - Storage provider instance
     */
    static getStorageProvider(config = {}) {
        const provider = config.provider || process.env.STORAGE_PROVIDER || 'aws';

        switch (provider.toLowerCase()) {
            case 'aws':
            case 's3':
                return new AwsS3Provider({
                    bucketName: config.bucketName || process.env.AWS_S3_BUCKET_NAME,
                    region: config.region || process.env.AWS_REGION || 'us-east-1',
                    accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
                });

            case 'digitalocean':
            case 'do':
            case 'spaces':
                return new DigitalOceanSpacesProvider({
                    bucketName: config.bucketName || process.env.DO_SPACES_BUCKET_NAME,
                    region: config.region || process.env.DO_SPACES_REGION || 'nyc3',
                    endpoint: config.endpoint || process.env.DO_SPACES_ENDPOINT,
                    accessKeyId: config.accessKeyId || process.env.DO_SPACES_ACCESS_KEY,
                    secretAccessKey: config.secretAccessKey || process.env.DO_SPACES_SECRET_KEY
                });

            default:
                console.warn(`⚠️  Unknown storage provider: ${provider}. Falling back to AWS S3.`);
                return new AwsS3Provider({
                    bucketName: config.bucketName || process.env.AWS_S3_BUCKET_NAME,
                    region: config.region || process.env.AWS_REGION || 'us-east-1',
                    accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
                });
        }
    }

    /**
     * Get storage provider for a specific file based on its URL
     * This is useful for backward compatibility when files are stored in different providers
     * @param {string} fileUrl - File URL or storage key
     * @returns {StorageProvider|null} - Storage provider instance or null if not found
     */
    static getProviderForFile(fileUrl) {
        if (!fileUrl) return null;

        // Check if it's an AWS S3 URL
        if (fileUrl.includes('.amazonaws.com') || fileUrl.includes('s3.')) {
            return new AwsS3Provider({
                bucketName: process.env.AWS_S3_BUCKET_NAME,
                region: process.env.AWS_REGION || 'us-east-1',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
        }

        // Check if it's a DigitalOcean Spaces URL
        if (fileUrl.includes('.digitaloceanspaces.com')) {
            return new DigitalOceanSpacesProvider({
                bucketName: process.env.DO_SPACES_BUCKET_NAME,
                region: process.env.DO_SPACES_REGION || 'nyc3',
                endpoint: process.env.DO_SPACES_ENDPOINT,
                accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
                secretAccessKey: process.env.DO_SPACES_SECRET_KEY
            });
        }

        // If it's just a key (starts with development/ or production/), use current provider
        if (fileUrl.startsWith('development/') || fileUrl.startsWith('production/')) {
            return this.getStorageProvider();
        }

        return null;
    }

    /**
     * Validate storage provider configuration
     * @param {string} provider - Provider name ('aws' or 'digitalocean')
     * @returns {Object} - { valid: boolean, missing: string[] }
     */
    static validateConfig(provider = null) {
        const selectedProvider = provider || process.env.STORAGE_PROVIDER || 'aws';
        const missing = [];

        if (selectedProvider === 'aws' || selectedProvider === 's3') {
            if (!process.env.AWS_S3_BUCKET_NAME) missing.push('AWS_S3_BUCKET_NAME');
            if (!process.env.AWS_REGION) missing.push('AWS_REGION');
            if (!process.env.AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID');
            if (!process.env.AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY');
        } else if (selectedProvider === 'digitalocean' || selectedProvider === 'do' || selectedProvider === 'spaces') {
            if (!process.env.DO_SPACES_BUCKET_NAME) missing.push('DO_SPACES_BUCKET_NAME');
            if (!process.env.DO_SPACES_REGION) missing.push('DO_SPACES_REGION');
            if (!process.env.DO_SPACES_ACCESS_KEY) missing.push('DO_SPACES_ACCESS_KEY');
            if (!process.env.DO_SPACES_SECRET_KEY) missing.push('DO_SPACES_SECRET_KEY');
        }

        return {
            valid: missing.length === 0,
            missing,
            provider: selectedProvider
        };
    }
}

module.exports = StorageFactory;
