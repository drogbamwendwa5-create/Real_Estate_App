const Property = require('../Models/Property');
const _ = require('lodash');

/**
 * Service for clustering properties on a map
 */
class PropertyClusterService {
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
   * Get clustered properties within bounds
   * @param {Object} bounds - { north, south, east, west }
   * @param {number} zoom - Current map zoom level
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Clusters and total count
   */
  async getClusteredProperties(bounds, zoom, filters = {}) {
    try {
      console.log(`[PropertyClusterService] Clustering properties at zoom ${zoom}`);
      const { north, south, east, west } = bounds;

      const baseQuery = {
        'location.coordinates': {
          $geoWithin: {
            $box: [
              [Number(west), Number(south)], // Bottom-left
              [Number(east), Number(north)]  // Top-right
            ]
          }
        },
        ...this._buildFilterQuery(filters)
      };

      const properties = await Property.find(baseQuery)
        .select('location price propertyType status bedrooms bathrooms area isFeatured address')
        .lean();

      // Simple grid-based clustering
      // Determine grid size based on zoom level
      const gridCount = Math.max(1, Math.min(zoom * 2, 20)); 
      const latStep = (north - south) / gridCount;
      const lngStep = (east - west) / gridCount;

      const clustersMap = new Map();

      properties.forEach(prop => {
        if (!prop.location || !prop.location.coordinates) return;
        const [lng, lat] = prop.location.coordinates;
        
        const gridX = Math.floor((lng - west) / lngStep);
        const gridY = Math.floor((lat - south) / latStep);
        const clusterId = `${gridX}-${gridY}`;

        if (!clustersMap.has(clusterId)) {
          clustersMap.set(clusterId, {
            lat: 0,
            lng: 0,
            count: 0,
            properties: [],
            bounds: {
              north: -90, south: 90, east: -180, west: 180
            }
          });
        }

        const cluster = clustersMap.get(clusterId);
        cluster.lat += lat;
        cluster.lng += lng;
        cluster.count += 1;
        
        // Update bounds
        cluster.bounds.north = Math.max(cluster.bounds.north, lat);
        cluster.bounds.south = Math.min(cluster.bounds.south, lat);
        cluster.bounds.east = Math.max(cluster.bounds.east, lng);
        cluster.bounds.west = Math.min(cluster.bounds.west, lng);

        // Keep small clusters as individual properties or list
        if (zoom >= 14 || cluster.count <= 10) {
          cluster.properties.push(prop);
        }
      });

      const clusters = Array.from(clustersMap.values()).map(c => ({
        ...c,
        lat: c.lat / c.count,
        lng: c.lng / c.count,
        // Don't send properties array if it's too large and zoomed out
        properties: (zoom < 14 && c.count > 10) ? [] : c.properties
      }));

      return {
        clusters,
        totalProperties: properties.length
      };
    } catch (error) {
      console.error('[PropertyClusterService] Error getting clustered properties:', error);
      throw error;
    }
  }

  /**
   * Get raw properties within bounds with pagination
   * @param {Object} bounds - { north, south, east, west }
   * @param {Object} filters - Search filters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Properties and pagination info
   */
  async getPropertiesInBounds(bounds, filters = {}, page = 1, limit = 20) {
    try {
      console.log(`[PropertyClusterService] Getting properties in bounds, page ${page}`);
      const { north, south, east, west } = bounds;

      const query = {
        'location.coordinates': {
          $geoWithin: {
            $box: [
              [Number(west), Number(south)],
              [Number(east), Number(north)]
            ]
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
      console.error('[PropertyClusterService] Error getting properties in bounds:', error);
      throw error;
    }
  }
}

module.exports = new PropertyClusterService();
