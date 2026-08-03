const axios = require('axios');
const NodeCache = require('node-cache');
const LocationConfig = require('../Config/LocationConfig');
const ErrorResponse = require('../Utils/errorResponse');

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
const reverseCache = new NodeCache({ stdTTL: 86400 });
// Limit concurrency to 1 request per second
const limit = createLimit(1);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ReverseGeocodeService {
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
   * Converts coordinates to address via Nominatim
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Structured address object
   */
  async reverseGeocode(lat, lng) {
    console.log(`[ReverseGeocodeService] Reverse geocoding lat:${lat}, lng:${lng}`);
    try {
      if (!lat || !lng) {
        throw new ErrorResponse('Coordinates are required', 400);
      }

      // Round coordinates to 4 decimal places for caching (~11m accuracy)
      const roundedLat = parseFloat(lat).toFixed(4);
      const roundedLng = parseFloat(lng).toFixed(4);
      const cacheKey = `revgeo_${roundedLat}_${roundedLng}`;

      const cachedResult = reverseCache.get(cacheKey);
      if (cachedResult) {
        console.log(`[ReverseGeocodeService] Returning cached result for coords`);
        return cachedResult;
      }

      const baseUrl = LocationConfig.nominatimReverseUrl || process.env.NOMINATIM_REVERSE_URL || 'https://nominatim.openstreetmap.org/reverse';
      
      const params = {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        extratags: 1
      };

      const data = await limit(async () => {
        await delay(1000);
        return this._fetchWithRetry(baseUrl, params);
      });

      if (!data || data.error) {
        throw new ErrorResponse('Location not found', 404);
      }

      const addressDetails = data.address || {};

      const formattedResult = {
        displayName: data.display_name,
        street: addressDetails.road || addressDetails.street,
        city: addressDetails.city || addressDetails.town || addressDetails.village,
        county: addressDetails.county,
        state: addressDetails.state,
        country: addressDetails.country,
        postalCode: addressDetails.postcode,
        ward: addressDetails.suburb || addressDetails.neighbourhood
      };

      reverseCache.set(cacheKey, formattedResult);
      return formattedResult;

    } catch (error) {
      console.error('[ReverseGeocodeService] Error during reverse geocoding:', error.message);
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse('Failed to reverse geocode coordinates', 500);
    }
  }

  /**
   * Extracts administrative boundaries via Nominatim
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Full admin hierarchy
   */
  async extractAdminBoundaries(lat, lng) {
    console.log(`[ReverseGeocodeService] Extracting admin boundaries for lat:${lat}, lng:${lng}`);
    try {
      const result = await this.reverseGeocode(lat, lng);
      return {
        ward: result.ward,
        city: result.city,
        county: result.county,
        state: result.state,
        country: result.country
      };
    } catch (error) {
      console.error('[ReverseGeocodeService] Error extracting boundaries:', error.message);
      throw new ErrorResponse('Failed to extract admin boundaries', 500);
    }
  }
}

module.exports = new ReverseGeocodeService();
