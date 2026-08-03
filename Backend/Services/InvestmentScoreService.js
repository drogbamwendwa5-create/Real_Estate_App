const Property = require('../Models/Property');
const NearbyAmenitiesService = require('./NearbyAmenitiesService');
const geolib = require('geolib');

/**
 * Service for calculating property investment viability
 */
class InvestmentScoreService {
  constructor() {
    // Configurable weights for scoring (total 100%)
    this.WEIGHTS = {
      rentalYield: 0.25,
      amenityScore: 0.20,
      locationScore: 0.20,
      marketDemand: 0.15,
      infrastructureScore: 0.20
    };

    // Configurable amenity impact weights
    this.AMENITY_WEIGHTS = {
      schools: 0.15,
      hospitals: 0.15,
      banks: 0.10,
      shopping: 0.15,
      restaurants: 0.10,
      pharmacies: 0.05,
      petrolStations: 0.05,
      policeStations: 0.05,
      universities: 0.20
    };

    // Reference Point: Nairobi CBD
    this.CITY_CENTER = { latitude: -1.2921, longitude: 36.8219 };
  }

  /**
   * Standalone location score based on proximity to center
   * @param {number} lat 
   * @param {number} lng 
   * @returns {number} Score out of 100
   */
  calculateLocationScore(lat, lng) {
    console.log('[InvestmentScoreService] Calculating location score');
    const distanceToCenter = geolib.getDistance(
      { latitude: lat, longitude: lng },
      this.CITY_CENTER
    );
    
    // Closer is better. Assuming > 20km gets low score
    const maxDesirableDistance = 20000; // 20km
    let score = 100 - ((distanceToCenter / maxDesirableDistance) * 100);
    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }

  /**
   * Calculate comprehensive investment score
   * @param {string} propertyId 
   * @returns {Promise<Object>} Detailed score metrics
   */
  async calculateInvestmentScore(propertyId) {
    try {
      console.log(`[InvestmentScoreService] Calculating investment score for ${propertyId}`);
      
      const property = await Property.findById(propertyId).lean();
      if (!property) throw new Error('Property not found');
      if (!property.location || !property.location.coordinates) {
        throw new Error('Property coordinates missing');
      }

      const [lng, lat] = property.location.coordinates;

      // 1. Amenity Score & Infrastructure Score
      let amenityScore = 50; // Default base
      let infrastructureScore = 50; // Default base

      try {
        const amenities = await NearbyAmenitiesService.getNearbyAmenities(lat, lng, 3000);
        let amenityTotal = 0;
        
        // Sum weighted counts
        Object.keys(this.AMENITY_WEIGHTS).forEach(key => {
          if (amenities[key] && Array.isArray(amenities[key])) {
            // Give points up to a maximum useful count per category
            const count = Math.min(amenities[key].length, 5); 
            amenityTotal += (count / 5) * this.AMENITY_WEIGHTS[key] * 100;
          }
        });
        amenityScore = Math.max(0, Math.min(100, amenityTotal));
        
        // Basic infrastructure estimation based on nearby amenities presence
        const hasPolice = amenities.policeStations && amenities.policeStations.length > 0;
        const hasHospitals = amenities.hospitals && amenities.hospitals.length > 0;
        infrastructureScore = 40 + (hasPolice ? 30 : 0) + (hasHospitals ? 30 : 0);
      } catch (e) {
        console.log('[InvestmentScoreService] Could not fetch amenities for scoring', e.message);
      }

      // 2. Location Score
      const locationScore = this.calculateLocationScore(lat, lng);

      // 3. Market Demand
      const views = property.views || 0;
      const isFeatured = property.isFeatured ? 20 : 0;
      let marketDemand = Math.min(100, (views / 1000) * 80 + isFeatured); // Naive formula

      // 4. Rental Yield (mock logic - ideally needs average area rental data)
      // Assuming a base 6% annual yield as score 60, up to 10% as score 100
      let rentalYield = 60; 
      if (property.price && property.price > 0 && property.propertyType !== 'land') {
        // Simple heuristic based on price and bedrooms for demo purposes
        const estMonthlyRent = (property.bedrooms || 1) * 30000;
        const annualYield = ((estMonthlyRent * 12) / property.price) * 100;
        rentalYield = Math.min(100, (annualYield / 10) * 100);
      }

      // 5. Overall Score Calculation
      const overall = (
        (rentalYield * this.WEIGHTS.rentalYield) +
        (amenityScore * this.WEIGHTS.amenityScore) +
        (locationScore * this.WEIGHTS.locationScore) +
        (marketDemand * this.WEIGHTS.marketDemand) +
        (infrastructureScore * this.WEIGHTS.infrastructureScore)
      );

      return {
        overall: Number(overall.toFixed(1)),
        rentalYield: Number(rentalYield.toFixed(1)),
        amenityScore: Number(amenityScore.toFixed(1)),
        locationScore: Number(locationScore.toFixed(1)),
        marketDemand: Number(marketDemand.toFixed(1)),
        infrastructureScore: Number(infrastructureScore.toFixed(1)),
        calculatedAt: new Date()
      };
    } catch (error) {
      console.error('[InvestmentScoreService] Error calculating investment score:', error);
      throw error;
    }
  }
}

module.exports = new InvestmentScoreService();
