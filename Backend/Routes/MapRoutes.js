const express = require('express');
const router = express.Router();

const {
  getProperties,
  getNearby,
  geocode,
  reverseGeocode,
  getRoute,
  getHeatmap,
  searchArea,
  getLocationScore,
  getInvestmentScore,
  polygonSearch
} = require('../Controllers/MapController');

// All endpoints are public as per requirements
router.get('/properties', getProperties);
router.get('/nearby', getNearby);
router.get('/geocode', geocode);
router.get('/reverse', reverseGeocode);
router.get('/route', getRoute);
router.get('/heatmap', getHeatmap);
router.get('/search-area', searchArea);
router.get('/location-score', getLocationScore);
router.get('/investment-score', getInvestmentScore);

// Polygon search requires POST due to large GeoJSON payloads
router.post('/polygon-search', polygonSearch);

module.exports = router;
