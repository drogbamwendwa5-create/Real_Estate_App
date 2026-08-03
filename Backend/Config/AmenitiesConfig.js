/**
 * Overpass API and Amenities Configuration
 */

const AmenitiesConfig = {
  overpassUrl: process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
  queryTemplates: {
    schools: 'amenity=school',
    hospitals: 'amenity=hospital',
    universities: 'amenity=university',
    banks: 'amenity=bank',
    shopping: 'shop=mall|supermarket|department_store',
    policeStations: 'amenity=police',
    restaurants: 'amenity=restaurant',
    pharmacies: 'amenity=pharmacy',
    petrolStations: 'amenity=fuel',
  },
  defaultRadiusMeters: 2000,
  maxResults: 20,
  cacheTtl: 3600,
  timeoutMs: 15000,
};

module.exports = Object.freeze(AmenitiesConfig);
