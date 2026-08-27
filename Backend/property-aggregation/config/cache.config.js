const cacheConfig = {
  enabled: process.env.NODE_ENV !== 'test' && (process.env.REDIS_ENABLED === 'true' || Boolean(process.env.REDIS_URL || process.env.REDIS_HOST)),
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    keyPrefix: "pa:",
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    retryStrategy: () => null,
  },
  ttl: {
    searchResults: 300,
    popularListings: 600,
    featuredProperties: 600,
    verifiedProperties: 600,
    recommendations: 900,
    nearbyProperties: 300,
    mapQueries: 300,
    propertyDetails: 600,
  },
  keys: {
    search: (p) => "search:" + JSON.stringify(p),
    featured: (l) => "featured:" + l,
    verified: (l) => "verified:" + l,
    nearby: (la, ln, r) => "nearby:" + la + "," + ln + "," + r,
    map: (b) => "map:" + JSON.stringify(b).substring(0, 100),
    recommendations: (u) => "rec:" + u,
  },
};

module.exports = cacheConfig;