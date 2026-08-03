const redis = require("ioredis");
const cc = require("../config/cache.config");

class PropertyCacheService {
  constructor() {
    this.client = null;
    if (cc.enabled) {
      this.client = new redis(cc.redis);
      this.client.on("error", () => {});
    }
  }

  async get(key) {
    if (!this.client) return null;
    try {
      const val = await this.client.get(cc.redis.keyPrefix + key);
      return val ? JSON.parse(val) : null;
    } catch (e) { return null; }
  }

  async set(key, value, ttl) {
    if (!this.client) return;
    try {
      await this.client.set(cc.redis.keyPrefix + key, JSON.stringify(value), "EX", ttl);
    } catch (e) {}
  }

  async del(key) {
    if (!this.client) return;
    try { await this.client.del(cc.redis.keyPrefix + key); } catch (e) {}
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
