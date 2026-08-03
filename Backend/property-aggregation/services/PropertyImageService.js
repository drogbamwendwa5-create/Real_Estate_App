/**
 * Property Image Service
 * Validates property images for quality, format, and duplicates.
 */
const ImageValidationService = require('../images/ImageValidationService');
const AggregatedProperty = require('../database/AggregatedProperty');

class PropertyImageService {
  constructor() {
    this.validator = new ImageValidationService();
  }

  async validatePropertyImages(propertyId) {
    const property = await AggregatedProperty.findById(propertyId).lean();
    if (!property) return { valid: 0, invalid: 0, results: [] };

    const results = await this.validator.validateImages(property.propertyImages);
    const valid = results.filter(r => r.isValid).length;
    const invalid = results.filter(r => !r.isValid).length;

    const invalidUrls = results.filter(r => !r.isValid).map(r => r.url);
    if (invalidUrls.length > 0) {
      await AggregatedProperty.updateOne(
        { _id: propertyId },
        { $set: { 'propertyImages.$[elem].isValid': false } },
        { arrayFilters: [{ 'elem.url': { $in: invalidUrls } }] }
      );
    }

    return { valid, invalid, results };
  }

  async validateAll(batchSize) {
    const count = await AggregatedProperty.countDocuments();
    let validated = 0;
    for (let i = 0; i < count; i += batchSize) {
      const properties = await AggregatedProperty.find().skip(i).limit(batchSize);
      for (const p of properties) {
        if (p.propertyImages && p.propertyImages.length > 0) {
          await this.validatePropertyImages(p._id);
          validated++;
        }
      }
    }
    return { validated, total: count };
  }
}

module.exports = PropertyImageService;
