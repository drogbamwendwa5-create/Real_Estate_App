/**
 * LocationService - Kenyan location geocoding and enrichment service.
 * Converts location names (Westlands, Karen, Ruaka, etc.) into coordinates.
 * Adds county, constituency, ward, and postal code information.
 * Supports major Kenyan towns, estates, and landmarks.
 */
class LocationService {
  constructor() {
    this.enabled = process.env.LOCATION_SERVICE_ENABLED !== 'false';
    this.geocodingApiKey = process.env.GEOCODING_API_KEY || null;
    
    // Kenyan location database (town/estate -> coordinates)
    this.locationDb = this._buildLocationDatabase();
  }

  /**
   * Geocode a location name to coordinates
   * @param {string} locationName - Location name (town, estate, area)
   * @param {Object} options - Additional context
   * @param {string} options.county - County name for disambiguation
   * @returns {Promise<Object>} Geocoded location
   */
  async geocode(locationName, options = {}) {
    if (!locationName) return null;

    const normalized = locationName.toLowerCase().trim();
    const result = {
      input: locationName,
      normalized,
      latitude: null,
      longitude: null,
      county: null,
      constituency: null,
      ward: null,
      postalCode: null,
      confidence: 0,
      source: 'database'
    };

    // Try exact match first
    const exactMatch = this.locationDb[normalized];
    if (exactMatch) {
      Object.assign(result, exactMatch);
      result.confidence = 1.0;
      return result;
    }

    // Try fuzzy match
    const fuzzyMatch = this._fuzzyMatch(normalized);
    if (fuzzyMatch) {
      Object.assign(result, fuzzyMatch);
      result.confidence = 0.9;
      return result;
    }

    // Try matching with county context
    if (options.county) {
      const countyLower = options.county.toLowerCase();
      const countyData = this._getCounties()[countyLower];
      if (countyData) {
        result.county = options.county;
        result.constituency = countyData.constituency || null;
        result.ward = countyData.ward || countyData.name || options.county;
        result.postalCode = countyData.postalCode || null;
        result.confidence = 0.5;
      }
    }

    // If geocoding API is available, try it
    if (this.geocodingApiKey) {
      try {
        const apiResult = await this._callGeocodingAPI(locationName, options.county);
        if (apiResult) {
          result.latitude = apiResult.lat;
          result.longitude = apiResult.lon;
          result.confidence = Math.max(result.confidence, 0.8);
          result.source = 'api';
        }
      } catch (error) {
        console.warn(`[LocationService] Geocoding API error for "${locationName}":`, error.message);
      }
    }

    return result;
  }

  /**
   * Geocode full address/description
   * @param {Object} property - Property with location fields
   * @returns {Promise<Object>} Enriched property with location data
   */
  async enrichProperty(property) {
    if (!this.enabled) return property;

    const enriched = { ...property };
    const locationText = [
      property.estate,
      property.town,
      property.county,
      property.location
    ].filter(Boolean).join(', ');

    if (!locationText) return property;

    // Try to geocode the best available location
    let geocodeResult = null;

    // Try estate first (most specific)
    if (property.estate) {
      geocodeResult = await this.geocode(property.estate, { county: property.county });
    }

    // Try town if estate failed
    if ((!geocodeResult || !geocodeResult.latitude) && property.town) {
      geocodeResult = await this.geocode(property.town, { county: property.county });
    }

    // Try full location text as last resort
    if (!geocodeResult || !geocodeResult.latitude) {
      geocodeResult = await this.geocode(locationText);
    }

    if (geocodeResult) {
      if (geocodeResult.latitude) {
        enriched.latitude = geocodeResult.latitude;
        enriched.longitude = geocodeResult.longitude;
      }
      if (geocodeResult.county && !enriched.county) {
        enriched.county = geocodeResult.county;
      }
      if (geocodeResult.constituency) {
        enriched.constituency = geocodeResult.constituency;
      }
      if (geocodeResult.ward) {
        enriched.ward = geocodeResult.ward;
      }
      if (geocodeResult.postalCode) {
        enriched.postalCode = geocodeResult.postalCode;
      }
      enriched.locationConfidence = geocodeResult.confidence;
      enriched.locationSource = geocodeResult.source;
    }

    return enriched;
  }

  /**
   * Get county information for a property
   * @param {string} countyName 
   * @returns {Object|null}
   */
  getCountyInfo(countyName) {
    if (!countyName) return null;
    const counties = this._getCounties();
    const normalized = countyName.toLowerCase().trim();
    return counties[normalized] || null;
  }

  /**
   * Check if a location is in the database
   * @param {string} locationName 
   * @returns {boolean}
   */
  hasLocation(locationName) {
    if (!locationName) return false;
    const normalized = locationName.toLowerCase().trim();
    return !!this.locationDb[normalized] || !!this._fuzzyMatch(normalized);
  }

  /**
   * Fuzzy match a location name
   * @param {string} name 
   * @returns {Object|null}
   */
  _fuzzyMatch(name) {
    // Try substring matching
    for (const [key, value] of Object.entries(this.locationDb)) {
      if (key.includes(name) || name.includes(key)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Call external geocoding API
   * @param {string} location 
   * @param {string} county 
   * @returns {Promise<Object|null>}
   */
  async _callGeocodingAPI(location, county) {
    try {
      const axios = require('axios');
      const query = county ? `${location}, ${county}, Kenya` : `${location}, Kenya`;
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'KE'
        },
        headers: {
          'User-Agent': 'RealEstateApp/1.0'
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Build the Kenyan location database
   * @returns {Object}
   */
  _buildLocationDatabase() {
    return {
      // Nairobi areas
      'westlands': { latitude: -1.2675, longitude: 36.8140, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'karen': { latitude: -1.3196, longitude: 36.7087, county: 'Nairobi', constituency: 'Lang\'ata', postalCode: '00502' },
      'kilimani': { latitude: -1.2850, longitude: 36.7840, county: 'Nairobi', constituency: 'Dagoretti North', postalCode: '00100' },
      'lavington': { latitude: -1.2760, longitude: 36.7670, county: 'Nairobi', constituency: 'Dagoretti North', postalCode: '00100' },
      'gigiri': { latitude: -1.2340, longitude: 36.8090, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'muthaiga': { latitude: -1.2450, longitude: 36.8280, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'kitisuru': { latitude: -1.2350, longitude: 36.7830, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'spring valley': { latitude: -1.2480, longitude: 36.8000, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'runda': { latitude: -1.2400, longitude: 36.7950, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'parklands': { latitude: -1.2600, longitude: 36.8020, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'highridge': { latitude: -1.2550, longitude: 36.8050, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'kipyegon': { latitude: -1.2700, longitude: 36.7900, county: 'Nairobi', postalCode: '00100' },
      'lavington green': { latitude: -1.2780, longitude: 36.7650, county: 'Nairobi', postalCode: '00100' },
      'langata': { latitude: -1.3400, longitude: 36.7500, county: 'Nairobi', constituency: 'Lang\'ata', postalCode: '00505' },
      'south b': { latitude: -1.3200, longitude: 36.8700, county: 'Nairobi', postalCode: '00100' },
      'south c': { latitude: -1.3250, longitude: 36.8750, county: 'Nairobi', postalCode: '00100' },
      'madaraka': { latitude: -1.3100, longitude: 36.8200, county: 'Nairobi', postalCode: '00100' },
      'hurlingham': { latitude: -1.2900, longitude: 36.7950, county: 'Nairobi', postalCode: '00100' },
      'upperhill': { latitude: -1.2750, longitude: 36.8080, county: 'Nairobi', postalCode: '00100' },
      'nairobi cbd': { latitude: -1.2833, longitude: 36.8167, county: 'Nairobi', postalCode: '00100' },
      'city centre': { latitude: -1.2833, longitude: 36.8167, county: 'Nairobi', postalCode: '00100' },
      'donholm': { latitude: -1.3000, longitude: 36.8800, county: 'Nairobi', postalCode: '00100' },
      'embakasi': { latitude: -1.3200, longitude: 36.9000, county: 'Nairobi', constituency: 'Embakasi', postalCode: '00501' },
      'kasarani': { latitude: -1.2300, longitude: 36.8800, county: 'Nairobi', constituency: 'Kasarani', postalCode: '00100' },
      'roysambu': { latitude: -1.2400, longitude: 36.8700, county: 'Nairobi', postalCode: '00100' },
      'thome': { latitude: -1.2300, longitude: 36.8600, county: 'Nairobi', postalCode: '00100' },
      'runda': { latitude: -1.2370, longitude: 36.8170, county: 'Nairobi', constituency: 'Westlands', postalCode: '00100' },
      'kipa': { latitude: -1.2500, longitude: 36.8100, county: 'Nairobi', postalCode: '00100' },
      'nyari': { latitude: -1.2420, longitude: 36.8050, county: 'Nairobi', postalCode: '00100' },
      'riverside': { latitude: -1.2600, longitude: 36.7900, county: 'Nairobi', postalCode: '00100' },
      'kilimani estate': { latitude: -1.2850, longitude: 36.7840, county: 'Nairobi', postalCode: '00100' },

      // Kiambu areas
      'ruaka': { latitude: -1.2000, longitude: 36.8000, county: 'Kiambu', constituency: 'Kiambu', postalCode: '00900' },
      'ruiru': { latitude: -1.1500, longitude: 36.9600, county: 'Kiambu', constituency: 'Ruiru', postalCode: '00232' },
      'thika': { latitude: -1.0333, longitude: 37.0667, county: 'Kiambu', constituency: 'Thika', postalCode: '01000' },
      'limuru': { latitude: -1.1000, longitude: 36.6500, county: 'Kiambu', postalCode: '00209' },
      'kiambu': { latitude: -1.1667, longitude: 36.8333, county: 'Kiambu', constituency: 'Kiambu', postalCode: '00900' },
      'juja': { latitude: -1.1000, longitude: 37.0167, county: 'Kiambu', postalCode: '00230' },
      'kikuyu': { latitude: -1.2500, longitude: 36.6667, county: 'Kiambu', postalCode: '00902' },
      'ngong road': { latitude: -1.3200, longitude: 36.7500, county: 'Nairobi', postalCode: '00505' },
      'tatu city': { latitude: -1.1000, longitude: 36.9000, county: 'Kiambu', postalCode: '00900' },

      // Machakos areas
      'kitengela': { latitude: -1.4833, longitude: 36.9500, county: 'Machakos', constituency: 'Mavoko', postalCode: '90100' },
      'athiriver': { latitude: -1.4500, longitude: 36.9667, county: 'Machakos', postalCode: '90100' },
      'machakos': { latitude: -1.5167, longitude: 37.2667, county: 'Machakos', constituency: 'Machakos', postalCode: '90100' },
      'mavoko': { latitude: -1.4667, longitude: 36.9667, county: 'Machakos', postalCode: '90100' },
      'syokimau': { latitude: -1.3667, longitude: 36.9000, county: 'Machakos', postalCode: '90100' },
      'mlolongo': { latitude: -1.3833, longitude: 36.9333, county: 'Machakos', postalCode: '90100' },

      // Kajiado areas
      'kajiado': { latitude: -1.8500, longitude: 36.7833, county: 'Kajiado', constituency: 'Kajiado', postalCode: '01100' },
      'ongata rongai': { latitude: -1.4000, longitude: 36.7500, county: 'Kajiado', postalCode: '01100' },
      'ngong': { latitude: -1.3667, longitude: 36.6500, county: 'Kajiado', postalCode: '01100' },
      'isinya': { latitude: -1.7000, longitude: 36.8500, county: 'Kajiado', postalCode: '01100' },
      'kitengela west': { latitude: -1.4833, longitude: 36.9333, county: 'Kajiado', postalCode: '01100' },

      // Mombasa areas
      'mombasa': { latitude: -4.0435, longitude: 39.6682, county: 'Mombasa', constituency: 'Mombasa', postalCode: '80100' },
      'nyali': { latitude: -4.0333, longitude: 39.7000, county: 'Mombasa', constituency: 'Nyali', postalCode: '80100' },
      'bamburi': { latitude: -3.9833, longitude: 39.7167, county: 'Mombasa', postalCode: '80100' },
      'shanzu': { latitude: -3.9833, longitude: 39.7333, county: 'Mombasa', postalCode: '80100' },
      'mtwapa': { latitude: -3.9333, longitude: 39.7333, county: 'Kilifi', postalCode: '80100' },
      'kilifi': { latitude: -3.6333, longitude: 39.8500, county: 'Kilifi', constituency: 'Kilifi', postalCode: '80100' },
      'ukunda': { latitude: -4.2833, longitude: 39.5667, county: 'Kwale', postalCode: '80400' },
      'diani': { latitude: -4.2667, longitude: 39.5667, county: 'Kwale', constituency: 'Msambweni', postalCode: '80400' },

      // Nakuru areas
      'nakuru': { latitude: -0.3031, longitude: 36.0800, county: 'Nakuru', constituency: 'Nakuru', postalCode: '20100' },
      'naivasha': { latitude: -0.7167, longitude: 36.4333, county: 'Nakuru', constituency: 'Naivasha', postalCode: '20117' },
      'gilgil': { latitude: -0.5000, longitude: 36.3333, county: 'Nakuru', postalCode: '20116' },
      'lanet': { latitude: -0.3333, longitude: 36.1500, county: 'Nakuru', postalCode: '20100' },
      'nakuru cbd': { latitude: -0.3031, longitude: 36.0800, county: 'Nakuru', postalCode: '20100' },

      // Other major towns
      'kisumu': { latitude: -0.1022, longitude: 34.7617, county: 'Kisumu', constituency: 'Kisumu', postalCode: '40100' },
      'eldoret': { latitude: 0.5143, longitude: 35.2698, county: 'Uasin Gishu', constituency: 'Eldoret', postalCode: '30100' },
      'nairobi': { latitude: -1.2921, longitude: 36.8219, county: 'Nairobi', postalCode: '00100' },
      'nanyuki': { latitude: 0.0167, longitude: 37.0667, county: 'Laikipia', postalCode: '10400' },
      'nanyuki town': { latitude: 0.0167, longitude: 37.0667, county: 'Laikipia', postalCode: '10400' },
      'meru': { latitude: 0.0500, longitude: 37.6500, county: 'Meru', constituency: 'Meru', postalCode: '60200' },
      'nyeri': { latitude: -0.4167, longitude: 36.9500, county: 'Nyeri', postalCode: '10100' },
      'malindi': { latitude: -3.2167, longitude: 40.1167, county: 'Kilifi', postalCode: '80200' },
      'watamu': { latitude: -3.3500, longitude: 40.0167, county: 'Kilifi', postalCode: '80200' },
      'lamu': { latitude: -2.2694, longitude: 40.9000, county: 'Lamu', postalCode: '80500' },

      // Mombasa Road corridor
      'mombasa road': { latitude: -1.3667, longitude: 36.8833, county: 'Nairobi', postalCode: '00100' },
      'airport area': { latitude: -1.3333, longitude: 36.9000, county: 'Nairobi', postalCode: '00501' },
      'jkia': { latitude: -1.3194, longitude: 36.9278, county: 'Nairobi', postalCode: '00501' },
      'eastleigh': { latitude: -1.2700, longitude: 36.8500, county: 'Nairobi', postalCode: '00100' },
      'pipeline': { latitude: -1.3000, longitude: 36.8800, county: 'Nairobi', postalCode: '00100' },
      'fedha': { latitude: -1.3100, longitude: 36.8800, county: 'Nairobi', postalCode: '00100' },

      // Developer estates
      'mi vida': { latitude: -1.2000, longitude: 36.8000, county: 'Kiambu', postalCode: '00900' },
      'tatu city': { latitude: -1.1000, longitude: 36.9000, county: 'Kiambu', postalCode: '00900' },
      'mvule gardens': { latitude: -1.2500, longitude: 36.7500, county: 'Nairobi', postalCode: '00100' },
      'jabavu village': { latitude: -1.3000, longitude: 36.7500, county: 'Nairobi', postalCode: '00100' },
      'acorn heights': { latitude: -1.2850, longitude: 36.7840, county: 'Nairobi', postalCode: '00100' },
      'kings developers': { latitude: -1.2000, longitude: 36.8500, county: 'Kiambu', postalCode: '00900' },
      'willstone homes': { latitude: -1.1500, longitude: 36.9000, county: 'Kiambu', postalCode: '00900' },
      'mahiga homes': { latitude: -1.2000, longitude: 36.8000, county: 'Kiambu', postalCode: '00900' },
      'kings pride': { latitude: -1.2500, longitude: 36.8500, county: 'Nairobi', postalCode: '00100' },
      'fanaka homes': { latitude: -1.2000, longitude: 36.8000, county: 'Kiambu', postalCode: '00900' },
      'home afrika': { latitude: -1.2000, longitude: 36.8500, county: 'Kiambu', postalCode: '00900' },
      'erdemann': { latitude: -1.3500, longitude: 36.7500, county: 'Nairobi', postalCode: '00100' },
      'karibu homes': { latitude: -1.2000, longitude: 36.8000, county: 'Kiambu', postalCode: '00900' },
      'muga developers': { latitude: -1.2500, longitude: 36.8500, county: 'Nairobi', postalCode: '00100' },
      'weston developers': { latitude: -1.1500, longitude: 36.9500, county: 'Kiambu', postalCode: '00232' }
    };
  }

  /**
   * Get Kenyan counties data
   * @returns {Object}
   */
  _getCounties() {
    return {
      'nairobi': { name: 'Nairobi', constituency: 'Nairobi County', ward: 'Nairobi', postalCode: '00100' },
      'kiambu': { name: 'Kiambu', constituency: 'Kiambu County', ward: 'Kiambu', postalCode: '00900' },
      'machakos': { name: 'Machakos', constituency: 'Machakos County', ward: 'Machakos', postalCode: '90100' },
      'kajiado': { name: 'Kajiado', constituency: 'Kajiado County', ward: 'Kajiado', postalCode: '01100' },
      'mombasa': { name: 'Mombasa', constituency: 'Mombasa County', ward: 'Mombasa', postalCode: '80100' },
      'kilifi': { name: 'Kilifi', constituency: 'Kilifi County', ward: 'Kilifi', postalCode: '80100' },
      'kwale': { name: 'Kwale', constituency: 'Kwale County', ward: 'Kwale', postalCode: '80400' },
      'nakuru': { name: 'Nakuru', constituency: 'Nakuru County', ward: 'Nakuru', postalCode: '20100' },
      'kisumu': { name: 'Kisumu', constituency: 'Kisumu County', ward: 'Kisumu', postalCode: '40100' },
      'uasin gishu': { name: 'Uasin Gishu', constituency: 'Uasin Gishu County', ward: 'Eldoret', postalCode: '30100' },
      'laikipia': { name: 'Laikipia', constituency: 'Laikipia County', ward: 'Laikipia', postalCode: '10400' },
      'meru': { name: 'Meru', constituency: 'Meru County', ward: 'Meru', postalCode: '60200' },
      'nyeri': { name: 'Nyeri', constituency: 'Nyeri County', ward: 'Nyeri', postalCode: '10100' },
      'lamu': { name: 'Lamu', constituency: 'Lamu County', ward: 'Lamu', postalCode: '80500' },
      'tana river': { name: 'Tana River', constituency: 'Tana River County', ward: 'Tana River', postalCode: '70100' },
      'garissa': { name: 'Garissa', constituency: 'Garissa County', ward: 'Garissa', postalCode: '70100' },
      'wajir': { name: 'Wajir', constituency: 'Wajir County', ward: 'Wajir', postalCode: '70200' },
      'mandera': { name: 'Mandera', constituency: 'Mandera County', ward: 'Mandera', postalCode: '70300' },
      'marsabit': { name: 'Marsabit', constituency: 'Marsabit County', ward: 'Marsabit', postalCode: '60500' },
      'isiolo': { name: 'Isiolo', constituency: 'Isiolo County', ward: 'Isiolo', postalCode: '60300' }
    };
  }
}

module.exports = LocationService;