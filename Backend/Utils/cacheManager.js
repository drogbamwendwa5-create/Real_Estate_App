const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
});

const getCache = () => cache;

const setCache = (key, value, ttl) => {
  cache.set(key, value, ttl || 600);
};

const getCacheItem = (key) => {
  return cache.get(key);
};

const deleteCacheItem = (key) => {
  cache.del(key);
};

const clearCache = () => {
  cache.flushAll();
};

module.exports = { getCache, setCache, getCacheItem, deleteCacheItem, clearCache };