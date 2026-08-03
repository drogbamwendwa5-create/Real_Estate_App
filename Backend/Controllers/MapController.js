const ErrorResponse = require('../Utils/errorResponse');
const MapService = require('../Services/MapService');
const GeocodeService = require('../Services/GeocodeService');
const ReverseGeocodeService = require('../Services/ReverseGeocodeService');
const NearbyAmenitiesService = require('../Services/NearbyAmenitiesService');
const RoutingService = require('../Services/RoutingService');
const PropertyClusterService = require('../Services/PropertyClusterService');
const PolygonSearchService = require('../Services/PolygonSearchService');
const InvestmentScoreService = require('../Services/InvestmentScoreService');
const HeatmapService = require('../Services/HeatmapService');

/**
 * @desc    Get clustered properties within bounds
 * @route   GET /maps/properties
 * @access  Public
 */
exports.getProperties = async (req, res, next) => {
  try {
    const { north, south, east, west, zoom, page, limit, propertyType, status, minPrice, maxPrice, bedrooms } = req.query;

    if (!north || !south || !east || !west) {
      return next(new ErrorResponse('Please provide north, south, east, and west bounds', 400));
    }

    const bounds = {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west)
    };

    if (!MapService.validateBoundingBox(bounds)) {
      return next(new ErrorResponse('Invalid bounding box coordinates', 400));
    }

    const filters = {
      propertyType,
      status,
      minPrice,
      maxPrice,
      bedrooms
    };

    const data = await PropertyClusterService.getClusteredProperties(bounds, parseInt(zoom) || 12, filters);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getProperties Error:', error);
    next(error);
  }
};

/**
 * @desc    Get nearby amenities
 * @route   GET /maps/nearby
 * @access  Public
 */
exports.getNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 2000, types } = req.query;

    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide lat and lng coordinates', 400));
    }

    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    if (!MapService.validateCoordinates(coordinates.lat, coordinates.lng)) {
      return next(new ErrorResponse('Invalid coordinates', 400));
    }

    let amenityTypes = [];
    if (types) {
      amenityTypes = types.split(',');
    }

    const data = await NearbyAmenitiesService.getNearbyAmenities(coordinates.lat, coordinates.lng, radius, amenityTypes);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getNearby Error:', error);
    next(error);
  }
};

/**
 * @desc    Geocode an address
 * @route   GET /maps/geocode
 * @access  Public
 */
exports.geocode = async (req, res, next) => {
  try {
    const { address, autocomplete } = req.query;

    if (!address) {
      return next(new ErrorResponse('Please provide an address to geocode', 400));
    }

    let data;
    if (autocomplete === 'true') {
      data = await GeocodeService.geocodeWithPhoton(address);
    } else {
      data = await GeocodeService.geocode(address);
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] geocode Error:', error);
    next(error);
  }
};

/**
 * @desc    Reverse geocode coordinates
 * @route   GET /maps/reverse
 * @access  Public
 */
exports.reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide lat and lng coordinates', 400));
    }

    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    if (!MapService.validateCoordinates(coordinates.lat, coordinates.lng)) {
      return next(new ErrorResponse('Invalid coordinates', 400));
    }

    const data = await ReverseGeocodeService.reverseGeocode(coordinates.lat, coordinates.lng);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] reverseGeocode Error:', error);
    next(error);
  }
};

/**
 * @desc    Get a route between two points
 * @route   GET /maps/route
 * @access  Public
 */
exports.getRoute = async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng, profile = 'driving' } = req.query;

    if (!fromLat || !fromLng || !toLat || !toLng) {
      return next(new ErrorResponse('Please provide fromLat, fromLng, toLat, and toLng', 400));
    }

    const start = { lat: parseFloat(fromLat), lng: parseFloat(fromLng) };
    const end = { lat: parseFloat(toLat), lng: parseFloat(toLng) };

    if (!MapService.validateCoordinates(start.lat, start.lng) || !MapService.validateCoordinates(end.lat, end.lng)) {
      return next(new ErrorResponse('Invalid coordinates provided', 400));
    }

    const data = await RoutingService.getRoute(start.lat, start.lng, end.lat, end.lng, profile);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getRoute Error:', error);
    next(error);
  }
};

/**
 * @desc    Get heatmap data
 * @route   GET /maps/heatmap
 * @access  Public
 */
exports.getHeatmap = async (req, res, next) => {
  try {
    const { north, south, east, west, zoom, type } = req.query;

    if (!north || !south || !east || !west) {
      return next(new ErrorResponse('Please provide north, south, east, and west bounds', 400));
    }

    const bounds = {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west)
    };

    if (!MapService.validateBoundingBox(bounds)) {
      return next(new ErrorResponse('Invalid bounding box coordinates', 400));
    }

    const data = await HeatmapService.generateHeatmapData(bounds, zoom, type);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getHeatmap Error:', error);
    next(error);
  }
};

/**
 * @desc    Search area and get flat list of properties
 * @route   GET /maps/search-area
 * @access  Public
 */
exports.searchArea = async (req, res, next) => {
  try {
    const { north, south, east, west, page, limit, propertyType, status, minPrice, maxPrice, bedrooms } = req.query;

    if (!north || !south || !east || !west) {
      return next(new ErrorResponse('Please provide north, south, east, and west bounds', 400));
    }

    const bounds = {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west)
    };

    if (!MapService.validateBoundingBox(bounds)) {
      return next(new ErrorResponse('Invalid bounding box coordinates', 400));
    }

    const filters = {
      propertyType,
      status,
      minPrice,
      maxPrice,
      bedrooms
    };

    const data = await PropertyClusterService.getPropertiesInBounds(bounds, page, limit, filters);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] searchArea Error:', error);
    next(error);
  }
};

/**
 * @desc    Get location score
 * @route   GET /maps/location-score
 * @access  Public
 */
exports.getLocationScore = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return next(new ErrorResponse('Please provide lat and lng coordinates', 400));
    }

    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    if (!MapService.validateCoordinates(coordinates.lat, coordinates.lng)) {
      return next(new ErrorResponse('Invalid coordinates', 400));
    }

    const data = await InvestmentScoreService.calculateLocationScore(coordinates.lat, coordinates.lng);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getLocationScore Error:', error);
    next(error);
  }
};

/**
 * @desc    Get investment score
 * @route   GET /maps/investment-score
 * @access  Public
 */
exports.getInvestmentScore = async (req, res, next) => {
  try {
    const { propertyId } = req.query;

    if (!propertyId) {
      return next(new ErrorResponse('Please provide a propertyId', 400));
    }

    const data = await InvestmentScoreService.calculateInvestmentScore(propertyId);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] getInvestmentScore Error:', error);
    next(error);
  }
};

/**
 * @desc    Search within a polygon
 * @route   POST /maps/polygon-search
 * @access  Public
 */
exports.polygonSearch = async (req, res, next) => {
  try {
    const { polygon, filters } = req.body;

    if (!polygon) {
      return next(new ErrorResponse('Please provide a GeoJSON polygon', 400));
    }

    if (!PolygonSearchService.validatePolygon(polygon)) {
      return next(new ErrorResponse('Invalid GeoJSON polygon provided', 400));
    }

    const data = await PolygonSearchService.searchInPolygon(polygon, filters);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[MapController] polygonSearch Error:', error);
    next(error);
  }
};
