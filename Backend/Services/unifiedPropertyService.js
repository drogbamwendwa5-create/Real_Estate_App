const Property = require('../Models/Property');
const AggregatedProperty = require('../property-aggregation/database/AggregatedProperty');
const PropertySearchService = require('../property-aggregation/search/PropertySearchService');
const PropertyCacheService = require('../property-aggregation/cache/PropertyCacheService');

const searchService = new PropertySearchService();
const cacheService = new PropertyCacheService();

/**
 * Unified property search across both Property (agent-uploaded)
 * and AggregatedProperty (internet-scraped).
 *
 * Returns a merged, de-duplicated result set.
 */
const unifiedSearch = async (query = {}, options = {}) => {
  const limit = options.limit || 20;
  const includeAggregated = options.includeAggregated !== false;
  const includeOriginal = options.includeOriginal !== false;

  let results = [];

  if (includeOriginal) {
    try {
      const originalResults = await searchService.search({
        ...query,
        limit,
      });
      const originalProperties = (originalResults.data || []).map((p) => ({
        ...p,
        _source: 'original',
      }));
      results = results.concat(originalProperties);
    } catch (err) {
      console.warn('[UnifiedSearch] Original search failed:', err.message);
    }
  }

  if (includeAggregated) {
    try {
      const aggregatedResult = await searchService.search({
        ...query,
        limit,
      });
      const aggregatedProperties = (aggregatedResult.data || []).map((p) => ({
        ...p,
        _source: 'aggregated',
      }));
      results = results.concat(aggregatedProperties);
    } catch (err) {
      console.warn('[UnifiedSearch] Aggregated search failed:', err.message);
    }
  }

  // De-duplicate by title similarity + location
  const seen = new Set();
  const deduped = [];
  for (const p of results) {
    const key = `${(p.title || '').toLowerCase().trim()}|${(p.county || p.address?.city || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  }

  // Sort by rankingScore descending (fallback to views)
  deduped.sort((a, b) => {
    const scoreA = a.rankingScore || a.views || 0;
    const scoreB = b.rankingScore || b.views || 0;
    return scoreB - scoreA;
  });

  return {
    count: deduped.length,
    data: deduped.slice(0, limit),
    sources: {
      original: results.filter((r) => r._source === 'original').length,
      aggregated: results.filter((r) => r._source === 'aggregated').length,
    },
  };
};

/**
 * Increment view count for either Property or AggregatedProperty.
 */
const incrementPropertyView = async (propertyId, source = 'original') => {
  try {
    if (source === 'aggregated') {
      await AggregatedProperty.findByIdAndUpdate(propertyId, { $inc: { views: 1 } });
    } else {
      await Property.findByIdAndUpdate(propertyId, { $inc: { views: 1 } });
    }
  } catch (error) {
    console.warn('[UnifiedPropertyService] increment view failed:', error.message);
  }
};

/**
 * Get featured properties from both sources.
 */
const getUnifiedFeatured = async (limit = 20) => {
  const [originalFeatured, aggregatedFeatured] = await Promise.all([
    Property.find({ isFeatured: true, isPublished: true })
      .sort('-views')
      .limit(limit)
      .lean(),
    AggregatedProperty.find({ isFeatured: true, isPublished: true })
      .sort({ rankingScore: -1 })
      .limit(limit)
      .lean(),
  ]);

  const combined = [
    ...originalFeatured.map((p) => ({ ...p, _source: 'original' })),
    ...aggregatedFeatured.map((p) => ({ ...p, _source: 'aggregated' })),
  ];

  combined.sort((a, b) => (b.views || b.rankingScore || 0) - (a.views || a.rankingScore || 0));

  return combined.slice(0, limit);
};

/**
 * Get nearby properties from both sources using geospatial queries.
 */
const getUnifiedNearby = async (coordinates, maxDistance = 10000, limit = 50) => {
  const [originalNearby, aggregatedNearby] = await Promise.all([
    Property.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistance,
        },
      },
      isPublished: true,
    })
      .limit(limit)
      .lean(),
    AggregatedProperty.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: maxDistance,
        },
      },
      isPublished: true,
      availability: 'available',
    })
      .sort({ rankingScore: -1 })
      .limit(limit)
      .lean(),
  ]);

  const combined = [
    ...originalNearby.map((p) => ({ ...p, _source: 'original' })),
    ...aggregatedNearby.map((p) => ({ ...p, _source: 'aggregated' })),
  ];

  return combined.slice(0, limit);
};

module.exports = {
  unifiedSearch,
  incrementPropertyView,
  getUnifiedFeatured,
  getUnifiedNearby,
};