/**
 * Property Update Service
 * Handles incremental updates to aggregated properties.
 */
const AggregatedProperty = require('../database/AggregatedProperty');
const PropertyRankingService = require('../ranking/PropertyRankingService');
const PropertyCacheService = require('../cache/PropertyCacheService');

class PropertyUpdateService {
  constructor() {
    this.rankingService = new PropertyRankingService();
    this.cache = new PropertyCacheService();
  }

  async updateProperty(propertyId, updates) {
    const property = await AggregatedProperty.findByIdAndUpdate(
      propertyId, updates, { new: true, runValidators: true }
    );
    if (property) {
      await this.rankingService.updateRanking(propertyId);
      await this.cache.invalidatePattern('search:*');
      await this.cache.invalidatePattern('featured:*');
      await this.cache.del('property:' + propertyId);
    }
    return property;
  }

  async updatePrice(propertyId, newPrice) {
    const property = await AggregatedProperty.findById(propertyId);
    if (!property) return null;
    const oldPrice = property.price;
    property.price = newPrice;
    await property.save();
    await this.rankingService.updateRanking(propertyId);
    await this.cache.invalidatePattern('search:*');
    return { property, oldPrice, newPrice };
  }

  async updateAvailability(propertyId, availability) {
    return await this.updateProperty(propertyId, { availability });
  }

  async removeInactive() {
    const result = await AggregatedProperty.updateMany(
      { postedDate: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, availability: 'available' },
      { availability: 'inactive', isPublished: false }
    );
    await this.cache.invalidatePattern('search:*');
    return result;
  }

  async updateViews(propertyId) {
    await AggregatedProperty.findByIdAndUpdate(propertyId, { $inc: { views: 1 } });
    return await this.cache.getOrSet('property:' + propertyId, async () => {
      return await AggregatedProperty.findById(propertyId).lean();
    });
  }
}

module.exports = PropertyUpdateService;
