/**
 * OpenStreetMap Tile Server and Map Configuration
 */

const MapConfig = {
  tileUrl: process.env.OPENSTREETMAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  defaultBounds: {
    lat: -1.2921,
    lng: 36.8219,
  },
  zoomLevels: {
    min: 3,
    max: 19,
    default: 12,
  },
  userAgent: process.env.OSM_USER_AGENT || 'RealEstateApp/1.0 (contact@example.com)',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

module.exports = Object.freeze(MapConfig);
