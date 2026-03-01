/**
 * Simple in-memory cache with TTL (Time To Live)
 * Useful for caching news API responses to reduce external API calls
 */

const config = require('../config');

class Cache {
    constructor(ttl = config.cache.ttl) {
        this.cache = new Map();
        this.ttl = ttl;
    }

    /**
     * Generate a cache key from user preferences
     * @param {Array} preferences - User's news preferences
     * @returns {string} Cache key
     */
    generateKey(preferences) {
        if (!preferences || preferences.length === 0) {
            return 'news:general';
        }
        return `news:${preferences.sort().join(',')}`;
    }

    /**
     * Get cached data if not expired
     * @param {string} key - Cache key
     * @returns {*|null} Cached data or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Check if cache has expired
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Set data in cache with TTL
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} [customTtl] - Optional custom TTL in milliseconds
     */
    set(key, data, customTtl) {
        const ttl = customTtl || this.ttl;
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttl,
            cachedAt: new Date().toISOString()
        });
    }

    /**
     * Delete a specific cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        let validCount = 0;
        let expiredCount = 0;
        const now = Date.now();

        for (const [key, item] of this.cache) {
            if (now > item.expiresAt) {
                expiredCount++;
            } else {
                validCount++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries: validCount,
            expiredEntries: expiredCount,
            ttlMs: this.ttl
        };
    }
}

// Export a singleton instance
module.exports = new Cache();

