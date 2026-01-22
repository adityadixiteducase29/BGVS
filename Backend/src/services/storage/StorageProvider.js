/**
 * Storage Provider Abstract Class
 * Defines the interface that all storage providers must implement
 */
class StorageProvider {
    /**
     * Upload a file to storage
     * @param {Buffer} buffer - File buffer
     * @param {string} key - Storage key/path
     * @param {string} contentType - MIME type
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} - { filePath, storageKey, provider }
     */
    async uploadFile(buffer, key, contentType, metadata = {}) {
        throw new Error('uploadFile must be implemented by storage provider');
    }

    /**
     * Delete a file from storage
     * @param {string} key - Storage key/path
     * @returns {Promise<boolean>} - Success status
     */
    async deleteFile(key) {
        throw new Error('deleteFile must be implemented by storage provider');
    }

    /**
     * Generate a pre-signed URL for file access
     * @param {string} key - Storage key/path
     * @param {number} expiresIn - Expiration time in seconds
     * @param {Object} options - Additional options (filename, content type, etc.)
     * @returns {Promise<string>} - Pre-signed URL
     */
    async getSignedUrl(key, expiresIn = 3600, options = {}) {
        throw new Error('getSignedUrl must be implemented by storage provider');
    }

    /**
     * Get the public URL for a file (if public access is enabled)
     * @param {string} key - Storage key/path
     * @returns {string} - Public URL
     */
    getPublicUrl(key) {
        throw new Error('getPublicUrl must be implemented by storage provider');
    }

    /**
     * Extract storage key from a URL
     * @param {string} url - Full URL
     * @returns {string|null} - Storage key or null if not valid
     */
    extractKeyFromUrl(url) {
        throw new Error('extractKeyFromUrl must be implemented by storage provider');
    }

    /**
     * Check if a URL belongs to this provider
     * @param {string} url - URL to check
     * @returns {boolean} - True if URL belongs to this provider
     */
    isProviderUrl(url) {
        throw new Error('isProviderUrl must be implemented by storage provider');
    }

    /**
     * Get provider name
     * @returns {string} - Provider name ('aws' or 'digitalocean')
     */
    getProviderName() {
        throw new Error('getProviderName must be implemented by storage provider');
    }
}

module.exports = StorageProvider;
