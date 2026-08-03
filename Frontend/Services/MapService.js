import api from './api';

class MapService {
  /**
   * Get properties for map display
   * @param {Object} params - Query parameters (bounds, filters)
   * @returns {Promise<Object>} Properties data
   */
  async getMapProperties(params) {
    try {
      console.log('[MapService] getMapProperties');
      const response = await api.get('/maps/properties', { params });
      return response.data;
    } catch (error) {
      console.error('[MapService] getMapProperties error:', error);
      throw error.response?.data || new Error('Failed to fetch map properties');
    }
  }

  /**
   * Get nearby amenities
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Radius in meters
   * @param {string[]} types - Array of amenity types
   * @returns {Promise<Object>} Amenities data
   */
  async getNearbyAmenities(lat, lng, radius, types) {
    try {
      console.log('[MapService] getNearbyAmenities');
      const response = await api.get('/maps/nearby', {
        params: { lat, lng, radius, types: types?.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('[MapService] getNearbyAmenities error:', error);
      throw error.response?.data || new Error('Failed to fetch nearby amenities');
    }
  }

  /**
   * Geocode an address
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Geocoding result
   */
  async geocode(address) {
    try {
      console.log('[MapService] geocode');
      const response = await api.get('/maps/geocode', { params: { address } });
      return response.data;
    } catch (error) {
      console.error('[MapService] geocode error:', error);
      throw error.response?.data || new Error('Failed to geocode address');
    }
  }

  /**
   * Autocomplete address search
   * @param {string} query - Search query
   * @returns {Promise<Object>} Autocomplete suggestions
   */
  async geocodeAutocomplete(query) {
    try {
      console.log('[MapService] geocodeAutocomplete');
      const response = await api.get('/maps/geocode', { params: { address: query, autocomplete: true } });
      return response.data;
    } catch (error) {
      console.error('[MapService] geocodeAutocomplete error:', error);
      throw error.response?.data || new Error('Failed to fetch autocomplete suggestions');
    }
  }

  /**
   * Reverse geocode coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Reverse geocoding result
   */
  async reverseGeocode(lat, lng) {
    try {
      console.log('[MapService] reverseGeocode');
      const response = await api.get('/maps/reverse', { params: { lat, lng } });
      return response.data;
    } catch (error) {
      console.error('[MapService] reverseGeocode error:', error);
      throw error.response?.data || new Error('Failed to reverse geocode');
    }
  }

  /**
   * Get routing between points
   * @param {number[]} from - [lat, lng] start point
   * @param {number[]} to - [lat, lng] end point
   * @param {string} profile - Routing profile (driving, walking, etc)
   * @returns {Promise<Object>} Route geometry and details
   */
  async getRoute(from, to, profile = 'driving') {
    try {
      console.log('[MapService] getRoute');
      const response = await api.get('/maps/route', {
        params: {
          startLat: from[0],
          startLng: from[1],
          endLat: to[0],
          endLng: to[1],
          profile
        }
      });
      return response.data;
    } catch (error) {
      console.error('[MapService] getRoute error:', error);
      throw error.response?.data || new Error('Failed to get route');
    }
  }

  /**
   * Get heatmap data
   * @param {string} bounds - Map bounds (minLng,minLat,maxLng,maxLat)
   * @param {string} type - Heatmap type (price, demand, etc)
   * @param {number} zoom - Current zoom level
   * @returns {Promise<Object>} Heatmap data points
   */
  async getHeatmapData(bounds, type, zoom) {
    try {
      console.log('[MapService] getHeatmapData');
      const response = await api.get('/maps/heatmap', {
        params: { bounds, type, zoom }
      });
      return response.data;
    } catch (error) {
      console.error('[MapService] getHeatmapData error:', error);
      throw error.response?.data || new Error('Failed to fetch heatmap data');
    }
  }

  /**
   * Search properties in area
   * @param {string} bounds - Map bounds
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Search results
   */
  async searchArea(bounds, filters = {}) {
    try {
      console.log('[MapService] searchArea');
      const response = await api.get('/maps/search-area', {
        params: { bounds, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('[MapService] searchArea error:', error);
      throw error.response?.data || new Error('Failed to search area');
    }
  }

  /**
   * Get location score for coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Location scores
   */
  async getLocationScore(lat, lng) {
    try {
      console.log('[MapService] getLocationScore');
      const response = await api.get('/maps/location-score', { params: { lat, lng } });
      return response.data;
    } catch (error) {
      console.error('[MapService] getLocationScore error:', error);
      throw error.response?.data || new Error('Failed to get location score');
    }
  }

  /**
   * Get investment score for property
   * @param {string} propertyId - Property ID
   * @returns {Promise<Object>} Investment analysis
   */
  async getInvestmentScore(propertyId) {
    try {
      console.log('[MapService] getInvestmentScore');
      const response = await api.get('/maps/investment-score', {
        params: { propertyId }
      });
      return response.data;
    } catch (error) {
      console.error('[MapService] getInvestmentScore error:', error);
      throw error.response?.data || new Error('Failed to get investment score');
    }
  }

  /**
   * Search properties within custom polygon
   * @param {Array<Object>} polygon - Array of {lat, lng} points
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Search results
   */
  async polygonSearch(polygon, filters = {}) {
    try {
      console.log('[MapService] polygonSearch');
      const response = await api.post('/maps/polygon-search', { polygon, filters });
      return response.data;
    } catch (error) {
      console.error('[MapService] polygonSearch error:', error);
      throw error.response?.data || new Error('Failed to perform polygon search');
    }
  }
}

export default new MapService();
