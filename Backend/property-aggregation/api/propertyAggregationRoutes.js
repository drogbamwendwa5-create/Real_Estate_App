/**
 * Property Aggregation API Routes
 * Mounted at /api/property-aggregation (independent of existing routes).
 */
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../Middleware/asyncHandler');
const { protect } = require('../../Middleware/auth');
const AggregatedProperty = require('../database/AggregatedProperty');
const PropertySearchService = require('../services/PropertySearchService');
const PropertyRecommendationService = require('../services/PropertyRecommendationService');
const PropertyMapService = require('../services/PropertyMapService');
const PropertyAggregatorService = require('../services/PropertyAggregatorService');
const PropertyCacheService = require('../cache/PropertyCacheService');

const searchService = new PropertySearchService();
const recService = new PropertyRecommendationService();
const mapService = new PropertyMapService();
const aggregator = new PropertyAggregatorService();
const cacheService = new PropertyCacheService();

// GET /api/property-aggregation/properties
router.get('/properties', asyncHandler(async (req, res) => {
  const result = await searchService.search(req.query);
  res.status(200).json({ success: true, ...result });
}));

// GET /api/property-aggregation/properties/:id
router.get('/properties/:id', asyncHandler(async (req, res) => {
  const property = await AggregatedProperty.findById(req.params.id).lean();
  if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
  await cacheService.set('property:' + req.params.id, property, 600);
  res.status(200).json({ success: true, data: property });
}));

// GET /api/property-aggregation/properties/search
router.get('/properties/search', asyncHandler(async (req, res) => {
  const result = await searchService.search(req.query);
  res.status(200).json({ success: true, ...result });
}));

// GET /api/property-aggregation/properties/new
router.get('/properties/new', asyncHandler(async (req, res) => {
  const properties = await searchService.getNew(req.query.limit || 20);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/featured
router.get('/properties/featured', asyncHandler(async (req, res) => {
  const properties = await searchService.getFeatured(req.query.limit || 10);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/recommended
router.get('/properties/recommended', protect, asyncHandler(async (req, res) => {
  const properties = await recService.getRecommendations(req.user._id, req.query.limit || 10);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/nearby
router.get('/properties/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });
  const properties = await mapService.getNearby(lat, lng, radius || 5000);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/map
router.get('/properties/map', asyncHandler(async (req, res) => {
  const properties = await mapService.getMapProperties(req.query.bounds, req.query);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/similar/:id
router.get('/properties/similar/:id', asyncHandler(async (req, res) => {
  const properties = await searchService.getSimilar(req.params.id, req.query.limit || 10);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/verified
router.get('/properties/verified', asyncHandler(async (req, res) => {
  const properties = await searchService.getVerified(req.query.limit || 10);
  res.status(200).json({ success: true, count: properties.length, data: properties });
}));

// GET /api/property-aggregation/properties/saved
router.get('/properties/saved', protect, asyncHandler(async (req, res) => {
  const PropertySaved = require('../database/PropertySaved');
  const saved = await PropertySaved.find({ userId: req.user._id }).populate('propertyId').lean();
  res.status(200).json({ success: true, count: saved.length, data: saved.map(s => s.propertyId).filter(Boolean) });
}));

// GET /api/property-aggregation/properties/history
router.get('/properties/history', protect, asyncHandler(async (req, res) => {
  const PropertySearchHistory = require('../database/PropertySearchHistory');
  const history = await PropertySearchHistory.find({ userId: req.user._id }).sort('-createdAt').limit(50).lean();
  res.status(200).json({ success: true, count: history.length, data: history });
}));

// POST /api/property-aggregation/properties/saved/:propertyId
router.post('/properties/saved/:propertyId', protect, asyncHandler(async (req, res) => {
  const PropertySaved = require('../database/PropertySaved');
  const { propertyId } = req.params;
  const userId = req.user._id;

  const existing = await PropertySaved.findOne({ userId, propertyId });
  if (existing) {
    await PropertySaved.deleteOne({ _id: existing._id });
    return res.status(200).json({ success: true, data: null, message: 'Removed from saved' });
  }

  const saved = await PropertySaved.create({ userId, propertyId });
  res.status(201).json({ success: true, data: saved });
}));

// POST /api/property-aggregation/properties/:id/view
router.post('/properties/:id/view', asyncHandler(async (req, res) => {
  const PropertyView = require('../database/PropertyView');
  const view = await PropertyView.create({
    propertyId: req.params.id,
    userId: req.user?._id || null,
    sessionId: req.body.sessionId || null,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    source: req.body.source || 'direct',
  });
  res.status(201).json({ success: true, data: view });
}));

// Unified search across original + aggregated properties
// GET /api/property-aggregation/unified/search
const unifiedPropertyService = require('../../Services/unifiedPropertyService');
router.get('/unified/search', asyncHandler(async (req, res) => {
  const result = await unifiedPropertyService.unifiedSearch(req.query, {
    limit: parseInt(req.query.limit) || 20,
    includeAggregated: req.query.includeAggregated !== 'false',
    includeOriginal: req.query.includeOriginal !== 'false',
  });
  res.status(200).json({ success: true, ...result });
}));

// GET /api/property-aggregation/unified/featured
router.get('/unified/featured', asyncHandler(async (req, res) => {
  const data = await unifiedPropertyService.getUnifiedFeatured(parseInt(req.query.limit) || 20);
  res.status(200).json({ success: true, count: data.length, data });
}));

module.exports = router;
