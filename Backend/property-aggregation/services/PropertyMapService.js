/**
 * Property Map Service
 * Map search, radius search, nearby search, and clustering.
 */
const PropertyLocationService = require('../geolocation/PropertyLocationService');
const AggregatedProperty = require('../database/AggregatedProperty');
const PropertyCacheService = require('../cache/PropertyCacheService');
const cacheConfig = require('../config/cache.config');

class PropertyMapService {
  constructor() {
    this.locationService = new PropertyLocationService();
    this.cache = new PropertyCacheService();
  }

  async getMapProperties(bounds, params) {
    const cacheKey = cacheConfig.keys.map(bounds);
    return await this.cache.getOrSet(cacheKey, async () => {
      const query = { isPublished: true, availability: 'available' };
      if (bounds) {
        query['location.coordinates'] = {
          $geoIntersects: {
            $geometry: { type: 'Polygon', coordinates: bounds },
          },
        };
      }
      if (params.propertyType) query.propertyType = params.propertyType;
      if (params.listingType) query.listingType = params.listingType;
      if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) query.price.$gte = parseInt(params.minPrice);
        if (params.maxPrice) query.price.$lte = parseInt(params.maxPrice);
      }
      return await AggregatedProperty.find(query).limit(params.limit || 100).lean();
    }, cacheConfig.ttl.mapQueries);
  }

  async getNearby(lat, lng, radius) {
    const cacheKey = cacheConfig.keys.nearby(lat, lng, radius);
    return await this.cache.getOrSet(cacheKey, async () => {
      const properties = await AggregatedProperty.find({
        isPublished: true,
        availability: 'available',
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: radius || 5000,
          },
        },
      }).limit(50).lean();
      return this.locationService.findNearby(properties, parseFloat(lat), parseFloat(lng), radius || 5000);
    }, cacheConfig.ttl.nearbyProperties);
  }

  clusterProperties(properties, gridSize) {
    return this.locationService.clusterProperties(properties, gridSize);
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    return this.locationService.calculateDistance(lat1, lng1, lat2, lng2);
  }
}

module.exports = PropertyMapService;
