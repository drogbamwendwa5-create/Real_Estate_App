/**
 * Property Validation Service
 * Runs validation and AI checks on properties.
 */
const PropertyValidator = require('../validators/PropertyValidator');
const AIPropertyValidator = require('../ai/AIPropertyValidator');
const AggregatedProperty = require('../database/AggregatedProperty');

class PropertyValidationService {
  constructor() {
    this.validator = new PropertyValidator();
    this.aiValidator = new AIPropertyValidator();
  }

  async validateProperty(propertyId) {
    const property = await AggregatedProperty.findById(propertyId).lean();
    if (!property) return { isValid: false, error: 'Property not found' };

    const result = this.validator.validate(property);
    const aiResult = this.aiValidator.validate(property);

    await AggregatedProperty.findByIdAndUpdate(propertyId, {
      validationScore: result.score,
      aiValidationScore: aiResult.score,
      aiValidationFlags: aiResult.flags,
      verifiedStatus: aiResult.isValid ? 'verified' : 'ai-flagged',
    });

    return {
      isValid: result.isValid,
      score: result.score,
      errors: result.errors,
      warnings: result.warnings,
      ai: { isValid: aiResult.isValid, score: aiResult.score, flags: aiResult.flags },
    };
  }

  async validateAll(batchSize) {
    const count = await AggregatedProperty.countDocuments();
    let validated = 0;
    for (let i = 0; i < count; i += batchSize) {
      const properties = await AggregatedProperty.find().skip(i).limit(batchSize);
      for (const p of properties) {
        await this.validateProperty(p._id);
        validated++;
      }
    }
    return { validated, total: count };
  }
}

module.exports = PropertyValidationService;
