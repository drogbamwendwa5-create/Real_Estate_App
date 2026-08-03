/**
 * Property Recommendation Service
 * Generates and retrieves property recommendations based on user search history.
 */
const AggregatedProperty = require('../database/AggregatedProperty');
const PropertyRecommendation = require('../database/PropertyRecommendation');
const PropertySearchHistory = require('../database/PropertySearchHistory');
const PropertyCacheService = require('../cache/PropertyCacheService');
const cacheConfig = require('../config/cache.config');

class PropertyRecommendationService {
  constructor() {
    this.cache = new PropertyCacheService();
  }

  async getRecommendations(userId, limit) {
    const cacheKey = cacheConfig.keys.recommendations(userId);
    return await this.cache.getOrSet(cacheKey, async () => {
      if (userId) {
        const recs = await PropertyRecommendation
          .find({ userId }).sort('-score').limit(limit || 10)
          .populate('propertyId').lean();
        if (recs.length > 0) return recs.map(r => r.propertyId).filter(Boolean);
      }
      return await AggregatedProperty
        .find({ isPublished: true, availability: 'available' })
        .sort('-rankingScore').limit(limit || 10).lean();
    }, cacheConfig.ttl.recommendations);
  }

  async generateRecommendations(userId, limit) {
    const history = await PropertySearchHistory
      .find({ userId }).sort('-createdAt').limit(20).lean();
    if (!history || history.length === 0) return [];

    const typeCounts = {};
    const locCounts = {};
    history.forEach(h => {
      if (h.filters && h.filters.propertyType) {
        typeCounts[h.filters.propertyType] = (typeCounts[h.filters.propertyType] || 0) + 1;
      }
      if (h.filters && h.filters.county) {
        locCounts[h.filters.county] = (locCounts[h.filters.county] || 0) + 1;
      }
    });

    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];

    const query = { isPublished: true, availability: 'available' };
    if (topType) query.propertyType = topType[0];
    if (topLoc) query.county = topLoc[0];

    const properties = await AggregatedProperty
      .find(query).sort('-rankingScore').limit(limit || 10).lean();

    const results = [];
    for (const prop of properties) {
      const score = this.calculateScore(prop, typeCounts, locCounts);
      await PropertyRecommendation.findOneAndUpdate(
        { userId, propertyId: prop._id },
        { userId, propertyId: prop._id, score, reason: 'based on search history' },
        { upsert: true }
      );
      results.push(prop);
    }
    return results;
  }

  calculateScore(property, typeCounts, locCounts) {
    let score = 50;
    if (typeCounts[property.propertyType]) score += 20;
    if (locCounts[property.county]) score += 20;
    if (property.rankingScore) score += property.rankingScore / 10;
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

module.exports = PropertyRecommendationService;
