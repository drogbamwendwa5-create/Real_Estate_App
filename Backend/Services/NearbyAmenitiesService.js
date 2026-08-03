const axios = require('axios');
const NodeCache = require('node-cache');
const geolib = require('geolib');
const AmenitiesConfig = require('../Config/AmenitiesConfig');
const ErrorResponse = require('../Utils/ErrorResponse');

// Cache with 1 hour TTL
const amenitiesCache = new NodeCache({ stdTTL: 3600 });

class NearbyAmenitiesService {
  /**
   * Queries Overpass API for nearby amenities
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters
   * @param {Array<string>} types - List of amenity types to search for
   * @returns {Promise<Array>} List of categorized amenities
   */
  async getNearbyAmenities(lat, lng, radius, types) {
    console.log(`[NearbyAmenitiesService] Getting amenities around lat:${lat}, lng:${lng}, radius:${radius}`);
    try {
      if (!lat || !lng || !radius || !types || !Array.isArray(types)) {
        throw new ErrorResponse('Invalid parameters provided', 400);
      }

      const roundedLat = parseFloat(lat).toFixed(4);
      const roundedLng = parseFloat(lng).toFixed(4);
      const typesKey = types.sort().join(',');
      const cacheKey = `amenities_${roundedLat}_${roundedLng}_${radius}_${typesKey}`;

      const cachedResult = amenitiesCache.get(cacheKey);
      if (cachedResult) {
        console.log('[NearbyAmenitiesService] Returning cached amenities');
        return cachedResult;
      }

      const baseUrl = AmenitiesConfig.overpassUrl || process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter';
      
      // Build Overpass QL query
      let queryElements = '';
      types.forEach(type => {
        const osmTag = AmenitiesConfig.typeMappings?.[type] || `amenity=${type}`; // fallback if no config
        queryElements += `node["${osmTag.split('=')[0]}"="${osmTag.split('=')[1]}"](around:${radius},${lat},${lng});`;
        queryElements += `way["${osmTag.split('=')[0]}"="${osmTag.split('=')[1]}"](around:${radius},${lat},${lng});`;
        queryElements += `relation["${osmTag.split('=')[0]}"="${osmTag.split('=')[1]}"](around:${radius},${lat},${lng});`;
      });

      const query = `
        [out:json][timeout:25];
        (
          ${queryElements}
        );
        out center;
      `;

      const response = await axios.post(baseUrl, query, {
        headers: { 'Content-Type': 'text/plain' }
      });

      if (!response.data || !response.data.elements) {
        return [];
      }

      const resultsByType = {};
      types.forEach(t => (resultsByType[t] = []));

      response.data.elements.forEach(element => {
        const elLat = element.lat || element.center?.lat;
        const elLng = element.lon || element.center?.lon;
        
        if (!elLat || !elLng) return;

        const distance = geolib.getDistance(
          { latitude: lat, longitude: lng },
          { latitude: elLat, longitude: elLng }
        );

        const tags = element.tags || {};
        const name = tags.name || 'Unnamed';
        const address = `${tags['addr:street'] || ''} ${tags['addr:city'] || ''}`.trim();

        // Determine type based on tags
        let matchedType = null;
        for (const type of types) {
          const osmTag = AmenitiesConfig.typeMappings?.[type] || `amenity=${type}`;
          const [k, v] = osmTag.split('=');
          if (tags[k] === v) {
            matchedType = type;
            break;
          }
        }

        if (matchedType) {
          resultsByType[matchedType].push({
            name,
            distance,
            lat: elLat,
            lng: elLng,
            address: address || null
          });
        }
      });

      const finalResults = Object.keys(resultsByType).map(type => {
        // Sort amenities by distance
        const sortedAmenities = resultsByType[type].sort((a, b) => a.distance - b.distance);
        return {
          type,
          amenities: sortedAmenities
        };
      });

      amenitiesCache.set(cacheKey, finalResults);
      return finalResults;

    } catch (error) {
      console.error('[NearbyAmenitiesService] Error fetching amenities:', error.message);
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse('Failed to fetch nearby amenities', 500);
    }
  }

  /**
   * Returns list of supported amenity types
   * @returns {Array<string>} Supported types
   */
  getSupportedTypes() {
    console.log('[NearbyAmenitiesService] Getting supported types');
    return AmenitiesConfig.supportedTypes || ['school', 'hospital', 'restaurant', 'bank', 'supermarket'];
  }
}

module.exports = new NearbyAmenitiesService();
