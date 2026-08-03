/**
 * CacheManager - Centralized caching service for the property aggregation system.
 * Caches visited URLs, property IDs, images, ranking, location lookups, and duplicates.
 * Uses in-memory cache with configurable TTL.
 * Falls back to a simple Map-based cache if no external cache is configured.
 */
const cacheConfig = require('../config/cache.config');

class CacheManager {
  constructor() {
    this.config = cacheConfig;
    this.cache = new Map();
    this.ttls = new Map();
    this.hits = 0;
    this.misses = 0;
    this.enabled = process.env.CACHE_ENABLED !== 'false';

    // Start periodic cleanup
    this._cleanupInterval = setInterval(() => this._cleanup(), 60000); // Clean every minute
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(key) {
    if (!this.enabled) return null;

    const normalizedKey = this._normalizeKey(key);
    const entry = this.cache.get(normalizedKey);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (this._isExpired(normalizedKey)) {
      this.cache.delete(normalizedKey);
      this.ttls.delete(normalizedKey);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds (default: from config or 24 hours)
   */
  async set(key, value, ttlMs = null) {
    if (!this.enabled) return;

    const normalizedKey = this._normalizeKey(key);
    const ttl = ttlMs || this.config.defaultTtl || 86400000; // 24 hours default

    this.cache.set(normalizedKey, {
      value,
      createdAt: Date.now()
    });
    this.ttls.set(normalizedKey, ttl);
  }

  /**
   * Check if a key exists in cache and is not expired
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (!this.enabled) return false;

    const normalizedKey = this._normalizeKey(key);
    if (!this.cache.has(normalizedKey)) return false;
    if (this._isExpired(normalizedKey)) {
      this.cache.delete(normalizedKey);
      this.ttls.delete(normalizedKey);
      return false;
    }
    return true;
  }

  /**
   * Delete a key from cache
   * @param {string} key
   */
  async del(key) {
    const normalizedKey = this._normalizeKey(key);
    this.cache.delete(normalizedKey);
    this.ttls.delete(normalizedKey);
  }

  /**
   * Clear all cache entries
   */
  async clear() {
    this.cache.clear();
    this.ttls.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? (this.hits / totalRequests * 100).toFixed(2) + '%' : '0%',
      enabled: this.enabled,
      config: this.config
    };
  }

  /**
   * Cache a visited URL to avoid re-scraping
   * @param {string} url
   * @param {number} ttlMs - TTL for URL cache
   */
  async cacheVisitedUrl(url, ttlMs = 86400000) { // 24 hours
    await this.set(`url:${url}`, true, ttlMs);
  }

  /**
   * Check if a URL has been visited
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  async isUrlVisited(url) {
    return await this.has(`url:${url}`);
  }

  /**
   * Cache a property ID to avoid duplicates
   * @param {string} propertyId
   */
  async cachePropertyId(propertyId) {
    await this.set(`prop:${propertyId}`, true, 86400000); // 24 hours
  }

  /**
   * Check if a property ID has been cached
   * @param {string} propertyId
   * @returns {Promise<boolean>}
   */
  async hasPropertyId(propertyId) {
    return await this.has(`prop:${propertyId}`);
  }

  /**
   * Cache image validation results
   * @param {string} imageUrl
   * @param {Object} validationResult
   */
  async cacheImageValidation(imageUrl, validationResult) {
    await this.set(`img:${imageUrl}`, validationResult, 3600000); // 1 hour
  }

  /**
   * Get cached image validation
   * @param {string} imageUrl
   * @returns {Promise<Object|null>}
   */
  async getImageValidation(imageUrl) {
    return await this.get(`img:${imageUrl}`);
  }

  /**
   * Cache location lookup results
   * @param {string} locationName
   * @param {Object} locationData
   */
  async cacheLocation(locationName, locationData) {
    const key = locationName.toLowerCase().trim();
    await this.set(`loc:${key}`, locationData, 604800000); // 7 days
  }

  /**
   * Get cached location data
   * @param {string} locationName
   * @returns {Promise<Object|null>}
   */
  async getLocation(locationName) {
    const key = locationName.toLowerCase().trim();
    return await this.get(`loc:${key}`);
  }

  /**
   * Cache duplicate check results
   * @param {string} fingerprint - Property fingerprint
   * @param {Object} duplicateResult
   */
  async cacheDuplicateCheck(fingerprint, duplicateResult) {
    await this.set(`dup:${fingerprint}`, duplicateResult, 3600000); // 1 hour
  }

  /**
   * Get cached duplicate check result
   * @param {string} fingerprint
   * @returns {Promise<Object|null>}
   */
  async getDuplicateCheck(fingerprint) {
    return await this.get(`dup:${fingerprint}`);
  }

  /**
   * Cache ranking results
   * @param {string} propertyId
   * @param {Object} rankingResult
   */
  async cacheRanking(propertyId, rankingResult) {
    await this.set(`rank:${propertyId}`, rankingResult, 3600000); // 1 hour
  }

  /**
   * Get cached ranking result
   * @param {string} propertyId
   * @returns {Promise<Object|null>}
   */
  async getRanking(propertyId) {
    return await this.get(`rank:${propertyId}`);
  }

  /**
   * Normalize a cache key
   * @param {string} key
   * @returns {string}
   */
  _normalizeKey(key) {
    return String(key).trim();
  }

  /**
   * Check if a cache entry is expired
   * @param {string} key
   * @returns {boolean}
   */
  _isExpired(key) {
    const entry = this.cache.get(key);
    const ttl = this.ttls.get(key);
    if (!entry || !ttl) return true;
    return Date.now() - entry.createdAt > ttl;
  }

  /**
   * Clean up expired cache entries
   */
  _cleanup() {
    const now = Date.now();
    let expired = 0;
    for (const [key, entry] of this.cache.entries()) {
      const ttl = this.ttls.get(key);
      if (ttl && now - entry.createdAt > ttl) {
        this.cache.delete(key);
        this.ttls.delete(key);
        expired++;
      }
    }
    if (expired > 0) {
      console.log(`[CacheManager] Cleaned up ${expired} expired entries. Cache size: ${this.cache.size}`);
    }
  }

  /**
   * Destroy the cache manager (cleanup interval)
   */
  destroy() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
    }
    this.cache.clear();
    this.ttls.clear();
  }
}

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;