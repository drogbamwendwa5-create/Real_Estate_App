const MapConfig = require('../Config/MapConfig');
const ErrorResponse = require('../Utils/errorResponse');

class MapService {
  /**
   * Generates a tile URL based on map config
   * @param {number} z - Zoom level
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string} Tile URL
   */
  getTileUrl(z, x, y) {
    try {
      console.log(`[MapService] Generating tile URL for z:${z}, x:${x}, y:${y}`);
      const baseUrl = MapConfig.tileServerUrl || process.env.TILE_SERVER_URL;
      if (!baseUrl) {
        throw new Error('Tile server URL not configured');
      }
      return `${baseUrl}/${z}/${x}/${y}.png`;
    } catch (error) {
      console.error('[MapService] Error generating tile URL:', error);
      throw new ErrorResponse('Failed to generate tile URL', 500);
    }
  }

  /**
   * Returns the map configuration
   * @returns {Object} Map configuration object
   */
  getMapConfig() {
    console.log('[MapService] Retrieving map configuration');
    return {
      defaults: MapConfig.defaults || {},
      bounds: MapConfig.bounds || {},
      zoomLevels: MapConfig.zoomLevels || {}
    };
  }

  /**
   * Validates coordinate ranges
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} True if valid, false otherwise
   */
  validateCoordinates(lat, lng) {
    console.log(`[MapService] Validating coordinates: lat:${lat}, lng:${lng}`);
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return false;
    }
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Validates a bounding box
   * @param {number} north - North latitude
   * @param {number} south - South latitude
   * @param {number} east - East longitude
   * @param {number} west - West longitude
   * @returns {boolean} True if valid, false otherwise
   */
  validateBoundingBox(north, south, east, west) {
    console.log(`[MapService] Validating bounding box: N:${north}, S:${south}, E:${east}, W:${west}`);
    return (
      this.validateCoordinates(north, east) &&
      this.validateCoordinates(south, west) &&
      north > south
    );
  }
}

module.exports = new MapService();
