/**
 * AIEnrichment - AI-powered property enrichment service.
 * Extracts schools, malls, hospitals, distance, amenities, parking, pool,
 * gym, fibre, security nearby.
 * Classifies properties as: luxury, mid range, affordable, student housing,
 * investment property, commercial, holiday home.
 * Uses keyword-based analysis as a fallback when no AI API is available.
 */
class AIEnrichment {
  constructor() {
    this.enabled = process.env.AI_ENRICHMENT_ENABLED === 'true';
    this.apiKey = process.env.AI_API_KEY || null;
    this.apiUrl = process.env.AI_API_URL || null;
  }

  /**
   * Enrich a property with AI-derived data
   * @param {Object} property - The property to enrich
   * @returns {Promise<Object>} Enriched property data
   */
  async enrich(property) {
    const enriched = {
      ...property,
      aiEnriched: true,
      aiEnrichedAt: new Date(),
      amenities: this._extractAmenities(property),
      nearbyPlaces: this._extractNearbyPlaces(property),
      category: this._classifyProperty(property),
      features: this._extractFeatures(property),
      marketInsights: this._generateMarketInsights(property)
    };

    // If AI API is configured, try to get AI-powered enrichment
    if (this.enabled && this.apiKey) {
      try {
        const aiResult = await this._callAIAPI(property);
        if (aiResult) {
          Object.assign(enriched, aiResult);
        }
      } catch (error) {
        console.warn('[AIEnrichment] AI API call failed, using keyword analysis:', error.message);
      }
    }

    return enriched;
  }

  /**
   * Extract amenities from property description and data
   * @param {Object} property 
   * @returns {string[]}
   */
  _extractAmenities(property) {
    const amenities = new Set(property.amenities || []);
    const text = [
      property.title || '',
      property.description || '',
      ...(property.amenities || [])
    ].join(' ').toLowerCase();

    const amenityKeywords = {
      'parking': ['parking', 'garage', 'car park', 'parkade', 'parking space'],
      'swimming pool': ['pool', 'swimming pool', 'swimming', 'dip'],
      'gym': ['gym', 'fitness', 'workout', 'exercise', 'gymnasium'],
      'fibre internet': ['fibre', 'fiber', 'internet', 'wifi', 'wi-fi', 'broadband'],
      'security': ['security', 'guard', 'cctv', 'alarm', 'secure', 'gated', 'electric fence'],
      'garden': ['garden', 'lawn', 'yard', 'compound', 'landscaped'],
      'servant quarters': ['servant quarter', 'sq', 'staff quarter', 'house help'],
      'dsq': ['dsq', 'domestic servant quarter'],
      'backup generator': ['generator', 'backup power', 'inverter'],
      'water tank': ['water tank', 'borehole', 'water storage', 'rainwater'],
      'solar': ['solar', 'solar panel', 'solar water', 'solar heating'],
      'air conditioning': ['ac', 'air conditioning', 'aircon', 'air condition', 'hvac', 'cooling'],
      'heating': ['heating', 'fireplace', 'central heating'],
      'balcony': ['balcony', 'terrace', 'patio', 'veranda', 'verandah'],
      'rooftop': ['rooftop', 'roof top', 'roof terrace'],
      'elevator': ['elevator', 'lift', 'elevator access'],
      'clubhouse': ['club', 'clubhouse', 'recreation', 'social hall'],
      'playground': ['playground', 'kids area', 'children', 'play area'],
      'pet friendly': ['pet', 'pets', 'dog', 'animal friendly'],
      'furnished': ['furnished', 'fully furnished', 'semi-furnished', 'furniture'],
      'maid service': ['maid', 'cleaning', 'housekeeping'],
      'guest house': ['guest house', 'guest', 'visitor'],
      'visitor parking': ['visitor parking', 'guest parking'],
      'waste disposal': ['waste', 'garbage', 'trash', 'refuse'],
      'laundry': ['laundry', 'washing', 'dryer'],
      'storage': ['storage', 'store', 'store room', 'storeroom'],
      'study': ['study', 'home office', 'office space'],
      'ensuite': ['ensuite', 'en-suite', 'master bedroom'],
      'walk-in closet': ['walk-in closet', 'walk in closet', 'dressing room', 'wardrobe'],
      'jacuzzi': ['jacuzzi', 'hot tub', 'spa', 'sauna'],
      'cinema': ['cinema', 'home theater', 'home theatre', 'movie room'],
      'wine cellar': ['wine cellar', 'wine room'],
      'intercom': ['intercom', 'intercom system'],
      'electric fence': ['electric fence', 'electric fencing', 'perimeter fence'],
      'rainwater harvesting': ['rainwater', 'rain water harvesting', 'water harvesting'],
      'septic tank': ['septic tank', 'septic', 'cesspool']
    };

    for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          // Capitalize amenity name
          amenities.add(amenity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          break;
        }
      }
    }

    return Array.from(amenities).sort();
  }

  /**
   * Extract nearby places (schools, malls, hospitals)
   * @param {Object} property 
   * @returns {Object}
   */
  _extractNearbyPlaces(property) {
    const text = [
      property.title || '',
      property.description || '',
      property.location || ''
    ].join(' ').toLowerCase();

    const nearby = {
      schools: [],
      hospitals: [],
      malls: [],
      distances: {}
    };

    // Extract school names mentioned in description
    const schoolPatterns = [
      /(\w+\s+(primary|secondary|school|academy|college|university|high school))/gi,
      /near\s+(\w+\s+school)/gi,
      /close\s+to\s+(\w+\s+school)/gi
    ];
    for (const pattern of schoolPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        nearby.schools.push(...matches.map(m => m.trim()));
      }
    }

    // Extract hospital/clinic names
    const hospitalPatterns = [
      /(\w+\s+(hospital|clinic|medical centre|health centre|dispensary))/gi,
      /near\s+(\w+\s+hospital)/gi
    ];
    for (const pattern of hospitalPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        nearby.hospitals.push(...matches.map(m => m.trim()));
      }
    }

    // Extract mall/shopping center names
    const mallPatterns = [
      /(\w+\s+(mall|shopping centre|shopping center|plaza|supermarket))/gi,
      /near\s+(\w+\s+mall)/gi
    ];
    for (const pattern of mallPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        nearby.malls.push(...matches.map(m => m.trim()));
      }
    }

    // Extract distance mentions
    const distancePatterns = [
      /(\d+(\.\d+)?)\s*(km|kilometer|meter|m)\s+(from|to|away)/gi,
      /(\d+)\s*min\s+(drive|walk|away)/gi
    ];
    for (const pattern of distancePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const parts = match.split(/\s+/);
          if (parts.length >= 2) {
            nearby.distances[match] = parts[0];
          }
        }
      }
    }

    return nearby;
  }

  /**
   * Classify property into category
   * @param {Object} property 
   * @returns {string}
   */
  _classifyProperty(property) {
    const text = [
      property.title || '',
      property.description || '',
      property.propertyType || ''
    ].join(' ').toLowerCase();
    const price = property.price || 0;
    const listingType = (property.listingType || '').toLowerCase();

    // Check for holiday home / short-term rental
    if (listingType.includes('holiday') || listingType.includes('short term') ||
        listingType.includes('vacation') || listingType.includes('airbnb') ||
        text.includes('holiday home') || text.includes('weekend') ||
        text.includes('short let') || text.includes('short stay') ||
        text.includes('vacation rental')) {
      return 'holiday home';
    }

    // Check for commercial
    if (listingType.includes('commercial') || listingType.includes('office') ||
        listingType.includes('shop') || listingType.includes('warehouse') ||
        text.includes('commercial') || text.includes('business premises') ||
        property.propertyType === 'commercial' || property.propertyType === 'office' ||
        property.propertyType === 'warehouse' || property.propertyType === 'shop') {
      return 'commercial';
    }

    // Check for investment property
    if (text.includes('investment') || text.includes('buy to let') ||
        text.includes('rental income') || text.includes('passive income') ||
        text.includes('high yield') || text.includes('return on investment') ||
        text.includes('capital appreciation') || text.includes('real estate investment')) {
      return 'investment property';
    }

    // Check for student housing
    if (text.includes('student') || text.includes('hostel') || text.includes('bedsitter') ||
        text.includes('bedsitter') || text.includes('university') || text.includes('campus') ||
        text.includes('college') || (property.propertyType === 'bedsitter' || property.propertyType === 'studio')) {
      return 'student housing';
    }

    // Price-based classification for residential
    if (listingType.includes('rent') || listingType === 'for-rent') {
      // Monthly rent classification
      if (price >= 150000) return 'luxury';
      if (price >= 50000) return 'mid range';
      if (price >= 10000) return 'affordable';
      return 'student housing';
    } else if (listingType.includes('sale') || listingType === 'for-sale') {
      // Sale price classification
      if (price >= 50000000) return 'luxury';
      if (price >= 15000000) return 'mid range';
      if (price >= 3000000) return 'affordable';
      return 'affordable';
    }

    // Default classification based on property type
    const type = (property.propertyType || '').toLowerCase();
    if (['villa', 'mansion', 'penthouse', 'luxury', 'estate'].some(t => type.includes(t))) {
      return 'luxury';
    }

    return 'mid range';
  }

  /**
   * Extract additional features from property data
   * @param {Object} property 
   * @returns {Object}
   */
  _extractFeatures(property) {
    const text = [
      property.title || '',
      property.description || ''
    ].join(' ').toLowerCase();

    return {
      hasParking: /parking|garage|car park/i.test(text),
      hasPool: /pool|swimming/i.test(text),
      hasGym: /gym|fitness|workout/i.test(text),
      hasFibre: /fibre|fiber|internet|wifi/i.test(text),
      hasSecurity: /security|guard|cctv|alarm|gated/i.test(text),
      hasGarden: /garden|lawn|yard|compound/i.test(text),
      hasGenerator: /generator|backup power|inverter/i.test(text),
      hasSolar: /solar/i.test(text),
      hasAC: /ac|air conditioning|aircon|hvac|cooling/i.test(text),
      furnished: /furnished|furniture/i.test(text) || property.furnished || false,
      petFriendly: /pet|pets|dog|animal friendly/i.test(text) || property.petsAllowed || false,
      serviced: /serviced/i.test(text) || property.serviced || false
    };
  }

  /**
   * Generate market insights for the property
   * @param {Object} property 
   * @returns {Object}
   */
  _generateMarketInsights(property) {
    const insights = {};
    const price = property.price || 0;

    // Price per bedroom analysis
    if (property.bedrooms && property.bedrooms > 0) {
      insights.pricePerBedroom = Math.round(price / property.bedrooms);
    }

    // Price per square meter
    if (property.size && property.size > 0) {
      insights.pricePerSqm = Math.round(price / property.size);
    }

    // Market segment
    const category = this._classifyProperty(property);
    insights.category = category;
    insights.segment = category === 'luxury' ? 'high-end' :
                       category === 'affordable' ? 'budget' : 'mid-market';

    // Investment potential
    if (property.listingType === 'for-rent') {
      insights.annualYield = property.price * 12; // Simplified yield calculation
      insights.investmentType = 'rental income';
    } else if (property.listingType === 'for-sale') {
      insights.investmentType = 'capital appreciation';
    }

    return insights;
  }

  /**
   * Call external AI API for enrichment
   * @param {Object} property 
   * @returns {Promise<Object|null>}
   */
  async _callAIAPI(property) {
    if (!this.apiKey || !this.apiUrl) return null;

    try {
      const axios = require('axios');
      const response = await axios.post(this.apiUrl, {
        prompt: this._buildAIPrompt(property),
        model: 'gpt-4',
        max_tokens: 500,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return this._parseAIResponse(response.data.choices[0].text);
      }

      return null;
    } catch (error) {
      console.warn('[AIEnrichment] AI API error:', error.message);
      return null;
    }
  }

  /**
   * Build AI prompt from property data
   * @param {Object} property 
   * @returns {string}
   */
  _buildAIPrompt(property) {
    return `Analyze this Kenyan property listing and extract structured data:

Title: ${property.title || ''}
Description: ${property.description || ''}
Price: KES ${property.price || ''}
Location: ${property.county || ''}, ${property.town || ''}, ${property.estate || ''}
Type: ${property.propertyType || ''}
Listing Type: ${property.listingType || ''}
Bedrooms: ${property.bedrooms || ''}
Bathrooms: ${property.bathrooms || ''}
Size: ${property.size || ''}sqm

Extract:
1. All amenities mentioned
2. Nearby places (schools, hospitals, malls)
3. Property category (luxury, mid range, affordable, student housing, investment, commercial, holiday home)
4. Key features (parking, pool, gym, security, etc.)
5. Market segment`;
  }

  /**
   * Parse AI API response
   * @param {string} text 
   * @returns {Object|null}
   */
  _parseAIResponse(text) {
    // Basic parsing of AI response text
    return {
      aiAnalysis: text,
      aiProcessedAt: new Date()
    };
  }

  /**
   * Check if AI enrichment is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = AIEnrichment;