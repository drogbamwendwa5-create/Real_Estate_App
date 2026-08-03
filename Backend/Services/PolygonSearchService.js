const Property = require('../Models/Property');

/**
 * Service for querying properties within a custom polygon
 */
class PolygonSearchService {
  /**
   * Validates a GeoJSON polygon
   * @param {Object} polygon - GeoJSON Polygon object
   * @returns {boolean} true if valid
   */
  validatePolygon(polygon) {
    try {
      console.log('[PolygonSearchService] Validating polygon structure');
      if (!polygon || typeof polygon !== 'object') return false;
      if (polygon.type !== 'Polygon') return false;
      if (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) return false;
      
      const ring = polygon.coordinates[0];
      if (!Array.isArray(ring) || ring.length < 4) return false; // Need at least 4 points (3 + 1 to close)

      // Check if it's a closed ring
      const firstPoint = ring[0];
      const lastPoint = ring[ring.length - 1];
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) return false;

      return true;
    } catch (error) {
      console.error('[PolygonSearchService] Error validating polygon:', error);
      return false;
    }
  }

  /**
   * Helper to build filter query
   * @private
   */
  _buildFilterQuery(filters = {}) {
    const query = {};
    if (filters.propertyType) query.propertyType = filters.propertyType;
    if (filters.status) query.status = filters.status;
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }
    if (filters.bedrooms) query.bedrooms = Number(filters.bedrooms);
    return query;
  }

  /**
   * Search for properties inside a custom polygon
   * @param {Object} polygon - GeoJSON Polygon
   * @param {Object} filters - Search filters
   * @param {number} page - Pagination page
   * @param {number} limit - Pagination limit
   * @returns {Promise<Object>} Paginated properties
   */
  async searchInPolygon(polygon, filters = {}, page = 1, limit = 20) {
    try {
      console.log('[PolygonSearchService] Searching properties within polygon');
      
      if (!this.validatePolygon(polygon)) {
        throw new Error('Invalid GeoJSON Polygon provided');
      }

      const query = {
        'location.coordinates': {
          $geoWithin: {
            $geometry: polygon
          }
        },
        ...this._buildFilterQuery(filters)
      };

      const skip = (Math.max(1, page) - 1) * limit;

      const [properties, total] = await Promise.all([
        Property.find(query)
          .skip(skip)
          .limit(limit)
          .lean(),
        Property.countDocuments(query)
      ]);

      return {
        properties,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[PolygonSearchService] Error searching in polygon:', error);
      throw error;
    }
  }
}

module.exports = new PolygonSearchService();
