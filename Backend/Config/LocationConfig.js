/**
 * Geocoding and Location Services Configuration
 */

const LocationConfig = {
  nominatimUrl: process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  photonUrl: process.env.PHOTON_URL || 'https://photon.komoot.io',
  kenyaViewbox: '33.9,-4.7,41.9,5.5',
  countryCode: 'ke',
  defaultLanguage: 'en',
  cacheTtl: 86400,
  rateLimit: {
    nominatimReqPerSec: 1,
  },
  geocoding: {
    resultLimit: 5,
  },
};

module.exports = Object.freeze(LocationConfig);
