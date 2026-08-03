const axios = require('axios');
const NodeCache = require('node-cache');
const LocationConfig = require('../Config/LocationConfig');
const ErrorResponse = require('../Utils/ErrorResponse');

// Simple queue-based concurrency limiter for CommonJS
const createLimit = (concurrency = 1) => {
  let active = 0;
  const queue = [];
  const next = () => {
    if (queue.length > 0 && active < concurrency) {
      active++;
      const { fn, resolve, reject } = queue.shift();
      fn().then(resolve).catch(reject).finally(() => {
        active--;
        next();
      });
    }
  };
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
};

// Cache with 24 hour TTL (in seconds)
const geocodeCache = new NodeCache({ stdTTL: 86400 });
// Limit concurrency to 1 request per second (Nominatim usage policy)
const limit = createLimit(1);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GeocodeService {
  constructor() {
    this.userAgent = 'RealEstateApp/1.0';
  }

  /**
   * Helper for retrying requests with exponential backoff
   */
  async _fetchWithRetry(url, params, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get(url, {
          params,
          headers: { 'User-Agent': this.userAgent }
        });
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await delay(Math.pow(2, i) * 1000);
      }
    }
  }

  /**
   * Forward geocoding via Nominatim
   * @param {string} address - Address to geocode
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Geocoding result
   */
  async geocode(address, options = {}) {
    console.log(`[GeocodeService] Geocoding address: ${address}`);
    try {
      if (!address) {
        throw new ErrorResponse('Address is required', 400);
      }

      const cacheKey = `geocode_${address.toLowerCase()}`;
      const cachedResult = geocodeCache.get(cacheKey);
      if (cachedResult) {
        console.log(`[GeocodeService] Returning cached result for: ${address}`);
        return cachedResult;
      }

      const baseUrl = LocationConfig.nominatimUrl || process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org/search';
      
      const params = {
        q: address,
        format: 'json',
        addressdetails: 1,
        countrycodes: LocationConfig.countryCode || 'ke',
        limit: 1,
        ...options
      };

      if (LocationConfig.viewbox) {
        params.viewbox = LocationConfig.viewbox;
        params.bounded = 1;
      }

      // Add small delay between requests to enforce 1 req/s
      const data = await limit(async () => {
        await delay(1000);
        return this._fetchWithRetry(baseUrl, params);
      });

      if (!data || data.length === 0) {
        throw new ErrorResponse('Address not found', 404);
      }

      const result = data[0];
      const addressDetails = result.address || {};

      const formattedResult = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
        county: addressDetails.county || addressDetails.state,
        city: addressDetails.city || addressDetails.town || addressDetails.village,
        type: result.type,
        boundingBox: result.boundingbox
      };

      geocodeCache.set(cacheKey, formattedResult);
      return formattedResult;

    } catch (error) {
      console.error('[GeocodeService] Error during geocoding:', error.message);
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse('Failed to geocode address', 500);
    }
  }

  /**
   * Fast autocomplete via Photon API
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of suggestions
   */
  async geocodeWithPhoton(query) {
    console.log(`[GeocodeService] Photon geocoding query: ${query}`);
    try {
      if (!query) return [];

      const baseUrl = LocationConfig.photonUrl || process.env.PHOTON_URL || 'https://photon.komoot.io/api';
      
      const params = {
        q: query,
        lon: LocationConfig.defaultLon || 36.8219, // Nairobi defaults
        lat: LocationConfig.defaultLat || -1.2921,
        limit: 5
      };

      const response = await axios.get(baseUrl, { params });
      
      return response.data.features.map(feature => ({
        name: feature.properties.name,
        city: feature.properties.city,
        county: feature.properties.county,
        state: feature.properties.state,
        country: feature.properties.country,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        formatted: [feature.properties.name, feature.properties.city, feature.properties.state].filter(Boolean).join(', ')
      }));

    } catch (error) {
      console.error('[GeocodeService] Error with Photon geocoding:', error.message);
      throw new ErrorResponse('Failed to fetch suggestions', 500);
    }
  }

  /**
   * Clears the geocode cache
   */
  clearCache() {
    console.log('[GeocodeService] Clearing geocode cache');
    geocodeCache.flushAll();
  }
}

module.exports = new GeocodeService();
