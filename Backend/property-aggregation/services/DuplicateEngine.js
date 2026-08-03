/**
 * DuplicateEngine - Duplicate property detection and merging service.
 * Compares properties by title, price, description, coordinates, location,
 * bedrooms, bathrooms, size, and images using similarity scoring.
 * If similarity > 85%, properties are considered duplicates and merged.
 */
const crypto = require('crypto');

class DuplicateEngine {
  constructor() {
    this.similarityThreshold = 0.85; // 85% similarity = duplicate
    this.weights = {
      title: 0.20,
      price: 0.15,
      description: 0.10,
      coordinates: 0.15,
      location: 0.10,
      bedrooms: 0.10,
      bathrooms: 0.10,
      size: 0.05,
      images: 0.05
    };
  }

  /**
   * Compare two properties and return a similarity score
   * @param {Object} a - First property
   * @param {Object} b - Second property
   * @returns {Object} Similarity result
   */
  compare(a, b) {
    const scores = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Compare title
    if (a.title && b.title) {
      scores.title = this._stringSimilarity(a.title, b.title);
      totalWeightedScore += scores.title * this.weights.title;
      totalWeight += this.weights.title;
    }

    // Compare price
    if (a.price && b.price) {
      scores.price = this._priceSimilarity(a.price, b.price);
      totalWeightedScore += scores.price * this.weights.price;
      totalWeight += this.weights.price;
    }

    // Compare description
    if (a.description && b.description) {
      scores.description = this._stringSimilarity(a.description, b.description);
      totalWeightedScore += scores.description * this.weights.description;
      totalWeight += this.weights.description;
    }

    // Compare coordinates
    if (a.latitude && b.latitude && a.longitude && b.longitude) {
      scores.coordinates = this._coordinateSimilarity(a.latitude, a.longitude, b.latitude, b.longitude);
      totalWeightedScore += scores.coordinates * this.weights.coordinates;
      totalWeight += this.weights.coordinates;
    }

    // Compare location
    if ((a.county || a.town || a.estate) && (b.county || b.town || b.estate)) {
      scores.location = this._locationSimilarity(a, b);
      totalWeightedScore += scores.location * this.weights.location;
      totalWeight += this.weights.location;
    }

    // Compare bedrooms
    if (a.bedrooms !== undefined && b.bedrooms !== undefined) {
      scores.bedrooms = a.bedrooms === b.bedrooms ? 1.0 : 0.0;
      totalWeightedScore += scores.bedrooms * this.weights.bedrooms;
      totalWeight += this.weights.bedrooms;
    }

    // Compare bathrooms
    if (a.bathrooms !== undefined && b.bathrooms !== undefined) {
      scores.bathrooms = a.bathrooms === b.bathrooms ? 1.0 : 0.0;
      totalWeightedScore += scores.bathrooms * this.weights.bathrooms;
      totalWeight += this.weights.bathrooms;
    }

    // Compare size
    if (a.size && b.size) {
      scores.size = this._numericalSimilarity(a.size, b.size, 0.2);
      totalWeightedScore += scores.size * this.weights.size;
      totalWeight += this.weights.size;
    }

    // Compare images
    if (a.images && b.images) {
      scores.images = this._imageSimilarity(a.images, b.images);
      totalWeightedScore += scores.images * this.weights.images;
      totalWeight += this.weights.images;
    }

    // Calculate final weighted score
    const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return {
      similarity: Math.round(finalScore * 100) / 100,
      isDuplicate: finalScore >= this.similarityThreshold,
      scores,
      weightedScore: totalWeightedScore,
      totalWeight
    };
  }

  /**
   * Check if a property is a duplicate of any in a list
   * @param {Object} property - Property to check
   * @param {Array} existingProperties - List of existing properties
   * @returns {Object} Duplicate check result
   */
  findDuplicate(property, existingProperties) {
    if (!Array.isArray(existingProperties) || existingProperties.length === 0) {
      return { isDuplicate: false, matches: [] };
    }

    const matches = [];

    for (const existing of existingProperties) {
      const comparison = this.compare(property, existing);
      if (comparison.isDuplicate) {
        matches.push({
          property: existing,
          similarity: comparison.similarity,
          scores: comparison.scores
        });
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: matches.length > 0,
      matches: matches.slice(0, 5), // Top 5 matches
      bestMatch: matches.length > 0 ? matches[0] : null
    };
  }

  /**
   * Merge two duplicate properties into one
   * @param {Object} primary - The primary property to keep
   * @param {Object} duplicate - The duplicate property to merge from
   * @returns {Object} Merged property
   */
  merge(primary, duplicate) {
    const merged = {
      ...primary,
      propertyID: primary.propertyID || duplicate.propertyID,
      mergedFrom: [
        ...(primary.mergedFrom || []),
        duplicate._id || duplicate.propertyID
      ].filter(Boolean),
      sourceURLs: [
        ...new Set([
          ...(primary.sourceURLs || [primary.sourceURL]),
          ...(duplicate.sourceURLs || [duplicate.sourceURL])
        ].filter(Boolean))
      ],
      sources: [
        ...new Set([
          ...(primary.sources || [primary.sourceName]),
          ...(duplicate.sources || [duplicate.sourceName])
        ].filter(Boolean))
      ],
      images: this._mergeImages(primary.images || [], duplicate.images || []),
      propertyImages: this._mergePropertyImages(
        primary.propertyImages || [],
        duplicate.propertyImages || []
      ),
      amenities: [
        ...new Set([
          ...(primary.amenities || []),
          ...(duplicate.amenities || [])
        ])
      ],
      duplicateScore: 1.0,
      mergedAt: new Date()
    };

    // Merge price history if available
    if (primary.priceHistory || duplicate.priceHistory) {
      merged.priceHistory = [
        ...(primary.priceHistory || []),
        ...(duplicate.priceHistory || [])
      ].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return merged;
  }

  /**
   * Calculate string similarity using Dice coefficient
   * @param {string} a 
   * @param {string} b 
   * @returns {number} 0-1 similarity score
   */
  _stringSimilarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1.0;

    // Normalize strings
    const s1 = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const s2 = b.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Use Dice coefficient on bigrams
    const bigrams1 = new Set();
    for (let i = 0; i < s1.length - 1; i++) {
      bigrams1.add(s1.substring(i, i + 2));
    }

    let intersection = 0;
    for (let i = 0; i < s2.length - 1; i++) {
      if (bigrams1.has(s2.substring(i, i + 2))) {
        intersection++;
      }
    }

    const total = s1.length - 1 + s2.length - 1;
    return total > 0 ? (2.0 * intersection) / total : 0;
  }

  /**
   * Calculate price similarity
   * @param {number} a 
   * @param {number} b 
   * @returns {number} 0-1 similarity score
   */
  _priceSimilarity(a, b) {
    if (a === b) return 1.0;
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    if (max === 0) return 0;
    const ratio = min / max;
    // 90-100% price match = similar
    if (ratio >= 0.9) return 0.9 + (ratio - 0.9) * 10 * 0.1;
    if (ratio >= 0.8) return 0.7 + (ratio - 0.8) * 10 * 0.2;
    return Math.max(0, ratio * 0.7);
  }

  /**
   * Calculate coordinate distance similarity
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @returns {number} 0-1 similarity score
   */
  _coordinateSimilarity(lat1, lon1, lat2, lon2) {
    // Haversine distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    // Within 100m = perfect match, 500m = 0.5, 1km = 0
    if (distance <= 100) return 1.0;
    if (distance >= 1000) return 0;
    return 1 - ((distance - 100) / 900);
  }

  /**
   * Calculate location similarity
   * @param {Object} a 
   * @param {Object} b 
   * @returns {number} 0-1 similarity score
   */
  _locationSimilarity(a, b) {
    let matches = 0;
    let total = 0;

    const fields = ['county', 'town', 'estate', 'suburb', 'ward'];
    for (const field of fields) {
      if (a[field] && b[field]) {
        total++;
        if (this._stringSimilarity(a[field], b[field]) > 0.8) {
          matches++;
        }
      }
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * Calculate numerical similarity
   * @param {number} a 
   * @param {number} b 
   * @param {number} tolerance - Allowed variance ratio (default: 0.1 = 10%)
   * @returns {number}
   */
  _numericalSimilarity(a, b, tolerance = 0.1) {
    if (a === b) return 1.0;
    const max = Math.max(a, b);
    const min = Math.min(a, b);
    if (max === 0) return 0;
    const ratio = min / max;
    return ratio >= (1 - tolerance) ? 1.0 : ratio;
  }

  /**
   * Calculate image similarity based on URL patterns
   * @param {Array} imagesA 
   * @param {Array} imagesB 
   * @returns {number}
   */
  _imageSimilarity(imagesA, imagesB) {
    if (!imagesA.length || !imagesB.length) return 0;

    const urlsA = imagesA.map(i => typeof i === 'string' ? i : (i.url || i.src || ''));
    const urlsB = imagesB.map(i => typeof i === 'string' ? i : (i.url || i.src || ''));

    let matches = 0;
    for (const urlA of urlsA) {
      for (const urlB of urlsB) {
        if (urlA === urlB || this._stringSimilarity(urlA, urlB) > 0.9) {
          matches++;
          break;
        }
      }
    }

    const total = Math.max(urlsA.length, urlsB.length);
    return total > 0 ? matches / total : 0;
  }

  /**
   * Merge image arrays
   * @param {Array} imagesA 
   * @param {Array} imagesB 
   * @returns {Array}
   */
  _mergeImages(imagesA, imagesB) {
    const merged = new Map();
    for (const img of [...imagesA, ...imagesB]) {
      const key = typeof img === 'string' ? img : (img.url || img.src);
      if (key && !merged.has(key)) {
        merged.set(key, img);
      }
    }
    return Array.from(merged.values());
  }

  /**
   * Merge propertyImages arrays (database format)
   * @param {Array} imagesA 
   * @param {Array} imagesB 
   * @returns {Array}
   */
  _mergePropertyImages(imagesA, imagesB) {
    const merged = new Map();
    for (const img of [...imagesA, ...imagesB]) {
      if (img && img.url && !merged.has(img.url)) {
        merged.set(img.url, img);
      }
    }
    return Array.from(merged.values());
  }

  /**
   * Generate a fingerprint for a property for quick duplicate lookup
   * @param {Object} property 
   * @returns {string}
   */
  generateFingerprint(property) {
    const data = [
      property.title?.toLowerCase().replace(/[^a-z0-9]/g, '') || '',
      property.price || 0,
      property.bedrooms || 0,
      property.bathrooms || 0,
      property.county || '',
      property.town || ''
    ].join('|');
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Get the configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      similarityThreshold: this.similarityThreshold,
      weights: this.weights
    };
  }
}

module.exports = DuplicateEngine;