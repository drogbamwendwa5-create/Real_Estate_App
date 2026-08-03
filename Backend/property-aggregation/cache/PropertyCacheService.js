const redis = require("ioredis");
const cc = require("../config/cache.config");

class PropertyCacheService {
  constructor() {
    this.client = null;
    if (cc.enabled) {
      try {
        this.client = new redis({
          ...cc.redis,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
          retryStrategy: cc.redis.retryStrategy,
        });
        this.client.on("error", () => {});
      } catch (e) {
        this.client = null;
      }
    }
  }

  async get(key) {
    if (!this.client) return null;
    if (this.client.status !== "ready") return null;
    try {
      const val = await Promise.race([
        this.client.get(cc.redis.keyPrefix + key),
        new Promise((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  }

  async set(key, value, ttl) {
    if (!this.client) return;
    if (this.client.status !== "ready") return;
    try {
      await Promise.race([
        this.client.set(cc.redis.keyPrefix + key, JSON.stringify(value), "EX", ttl),
        new Promise((resolve) => setTimeout(() => resolve(), 2000)),
      ]);
    } catch (e) {}
  }

  async del(key) {
    if (!this.client) return;
    if (this.client.status !== "ready") return;
    try {
      await Promise.race([
        this.client.del(cc.redis.keyPrefix + key),
        new Promise((resolve) => setTimeout(() => resolve(), 2000)),
      ]);
    } catch (e) {}
  }

  async getOrSet(key, fetcher, ttl) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }
}

module.exports = PropertyCacheService;