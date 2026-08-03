/**
 * RankingEngine - Property ranking and scoring service.
 * Calculates a 0-100 ranking score based on:
 * images, seller reputation, freshness, source quality, property type,
 * location quality, price quality, verified agent, and AI score.
 */
const rankingConfig = require('../config/ranking.config');

class RankingEngine {
  constructor() {
    this.config = rankingConfig;
    this.weights = {
      images: 10,
      sellerReputation: 10,
      freshness: 15,
      sourceQuality: 10,
      propertyType: 5,
      locationQuality: 10,
      priceQuality: 10,
      verifiedAgent: 15,
      aiScore: 10,
      completeness: 5
    };
  }

  /**
   * Calculate the overall ranking score for a property (0-100)
   * @param {Object} property - The property to rank
   * @returns {Object} Ranking result with score and breakdown
   */
  rank(property) {
    const scores = {};

    scores.images = this._scoreImages(property);
    scores.sellerReputation = this._scoreSellerReputation(property);
    scores.freshness = this._scoreFreshness(property);
    scores.sourceQuality = this._scoreSourceQuality(property);
    scores.propertyType = this._scorePropertyType(property);
    scores.locationQuality = this._scoreLocationQuality(property);
    scores.priceQuality = this._scorePriceQuality(property);
    scores.verifiedAgent = this._scoreVerifiedAgent(property);
    scores.aiScore = this._scoreAI(property);
    scores.completeness = this._scoreCompleteness(property);

    // Calculate weighted total
    let totalScore = 0;
    let totalWeight = 0;
    for (const [key, weight] of Object.entries(this.weights)) {
      if (scores[key] !== undefined) {
        totalScore += scores[key] * weight;
        totalWeight += weight;
      }
    }

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const clampedScore = Math.max(0, Math.min(100, finalScore));

    return {
      score: clampedScore,
      breakdown: scores,
      normalizedScore: clampedScore / 100,
      label: this._getLabel(clampedScore)
    };
  }

  /**
   * Score based on image count and quality
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreImages(property) {
    const images = property.propertyImages || property.images || [];
    const validImages = images.filter(img => {
      if (typeof img === 'string') return true;
      return img && img.isValid !== false;
    });
    const count = validImages.length;

    if (count >= 10) return 100;
    if (count >= 5) return 80;
    if (count >= 3) return 60;
    if (count >= 1) return 40;
    return 0;
  }

  /**
   * Score based on seller/developer reputation
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreSellerReputation(property) {
    let score = 0;

    // Developer listings are more reputable
    if (property.isDeveloperListing) score += 40;
    if (property.isVerifiedAgent) score += 30;
    if (property.agentName) score += 15;
    if (property.agencyName) score += 15;

    return Math.min(100, score);
  }

  /**
   * Score based on listing freshness (how recently posted/updated)
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreFreshness(property) {
    const now = new Date();
    const updated = property.lastUpdated || property.postedDate || now;
    const daysSinceUpdate = (now - new Date(updated)) / (1000 * 60 * 60 * 24);

    // Within 7 days = full score, over 90 days = 0
    if (daysSinceUpdate <= 7) return 100;
    if (daysSinceUpdate >= 90) return 0;
    return Math.round(100 - ((daysSinceUpdate - 7) / (90 - 7)) * 100);
  }

  /**
   * Score based on source quality
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreSourceQuality(property) {
    const source = (property.sourceName || '').toLowerCase();

    // High-quality sources
    const highQuality = [
      'property24', 'buyrent', 'kenyapropertycentre',
      'knight frank', 'pam golding', 'hass consult',
      'centum', 'superior homes', 'mi vida'
    ];
    // Medium-quality sources
    const mediumQuality = [
      'jiji', 'hauzisha', 'pigianme', 'rentkenya',
      'facebook', 'instagram'
    ];

    if (highQuality.some(s => source.includes(s))) return 100;
    if (mediumQuality.some(s => source.includes(s))) return 60;
    return 40;
  }

  /**
   * Score based on property type
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scorePropertyType(property) {
    const type = (property.propertyType || '').toLowerCase();

    // Residential properties score higher
    const residential = ['apartment', 'house', 'villa', 'townhouse', 'bungalow', 'mansion'];
    const commercial = ['office', 'shop', 'warehouse', 'land', 'commercial'];

    if (residential.some(t => type.includes(t))) return 100;
    if (commercial.some(t => type.includes(t))) return 60;
    return 50;
  }

  /**
   * Score based on location quality
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreLocationQuality(property) {
    let score = 0;

    // Has coordinates
    if (property.latitude && property.longitude) score += 40;
    // Has county
    if (property.county) score += 20;
    // Has town
    if (property.town) score += 20;
    // Has estate/neighborhood
    if (property.estate) score += 20;

    // Premium locations bonus
    const premium = ['westlands', 'karen', 'ruaka', 'kilimani', 'nyali', 'diani', 'kipyegon', 'lavington', 'gigiri', 'spring valley', 'runda', 'muthaiga', 'kitisuru'];
    if (property.town && premium.some(p => property.town.toLowerCase().includes(p))) score += 10;
    if (property.estate && premium.some(p => property.estate.toLowerCase().includes(p))) score += 10;

    return Math.min(100, score);
  }

  /**
   * Score based on price quality
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scorePriceQuality(property) {
    if (!property.price || property.price <= 0) return 0;

    // Price is present and reasonable
    let score = 50;

    // Price is within reasonable range for Kenyan market
    if (property.price > 1000) score += 25; // Not token price
    if (property.price < 1000000000) score += 25; // Not absurdly high

    // Has listing type (for-sale or for-rent)
    if (property.listingType) score += 10;

    return Math.min(100, score);
  }

  /**
   * Score based on verified agent status
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreVerifiedAgent(property) {
    if (property.verifiedStatus === 'verified') return 100;
    if (property.isVerifiedAgent) return 80;
    if (property.agentName && property.agentPhone) return 60;
    if (property.agentName) return 40;
    return 0;
  }

  /**
   * Score based on AI enrichment data
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreAI(property) {
    let score = 0;

    // Has AI validation score
    if (property.aiValidationScore) score += property.aiValidationScore * 100;
    // Has AI-extracted amenities
    if (property.amenities && property.amenities.length > 0) score += 20;
    // Has AI classification
    if (property.aiCategory) score += 20;
    // Has nearby places data
    if (property.nearbyPlaces) score += 20;

    return Math.min(100, score);
  }

  /**
   * Score based on data completeness
   * @param {Object} property 
   * @returns {number} 0-100
   */
  _scoreCompleteness(property) {
    const fields = [
      'title', 'description', 'price', 'propertyType', 'listingType',
      'county', 'town', 'bedrooms', 'bathrooms', 'size',
      'agentName', 'agentPhone', 'amenities'
    ];

    let filled = 0;
    const total = fields.length;

    for (const field of fields) {
      const value = property[field];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) continue;
        filled++;
      }
    }

    return Math.round((filled / total) * 100);
  }

  /**
   * Get a label for the score
   * @param {number} score 
   * @returns {string}
   */
  _getLabel(score) {
    if (score >= 90) return 'premium';
    if (score >= 75) return 'featured';
    if (score >= 60) return 'high';
    if (score >= 40) return 'standard';
    if (score >= 20) return 'basic';
    return 'low';
  }

  /**
   * Get the ranking configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      weights: this.weights,
      config: this.config
    };
  }
}

module.exports = RankingEngine;