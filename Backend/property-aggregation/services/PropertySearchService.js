const AggregatedProperty = require("../database/AggregatedProperty");
const PropertyCacheService = require("../cache/PropertyCacheService");
const cacheConfig = require("../config/cache.config");

// Keep list responses small. Details are fetched separately when a user opens a property.
const LISTING_PROJECTION = [
  "title", "price", "currency", "listingType", "propertyType",
  "county", "town", "estate", "latitude", "longitude", "location",
  "bedrooms", "bathrooms", "size", "furnished", "serviced",
  "propertyImages", "rankingScore", "isFeatured", "postedDate", "createdAt"
].join(" ");

class PropertySearchService {
  constructor() {
    this.cache = new PropertyCacheService();
  }

  async search(params = {}) {
    const cacheKey = cacheConfig.keys.search(params);
    return await this.cache.getOrSet(cacheKey, async () => {
      const query = { isPublished: true, availability: "available" };

      // Apply filters
      if (params.county) query.county = new RegExp(params.county, "i");
      if (params.town) query.town = new RegExp(params.town, "i");
      if (params.estate) query.estate = new RegExp(params.estate, "i");
      if (params.propertyType && params.propertyType !== 'all') query.propertyType = params.propertyType;
      if (params.listingType) query.listingType = params.listingType;

      if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) query.price["$gte"] = parseInt(params.minPrice);
        if (params.maxPrice) query.price["$lte"] = parseInt(params.maxPrice);
      }

      if (params.bedrooms && params.bedrooms !== 'any') {
        query.bedrooms = { $gte: parseInt(params.bedrooms) };
      }
      if (params.bathrooms && params.bathrooms !== 'any') {
        query.bathrooms = { $gte: parseInt(params.bathrooms) };
      }

      if (params.furnished === "true" || params.furnished === true) query.furnished = true;
      if (params.serviced === "true" || params.serviced === true) query.serviced = true;
      if (params.verified === "true" || params.verified === true) query.verifiedStatus = "verified";
      if (params.developer === "true" || params.developer === true) query.isDeveloperListing = true;

      // Text/Keyword search across title, description, county, town, estate
      if (params.search) {
        const searchRegex = new RegExp(params.search, "i");
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { county: searchRegex },
          { town: searchRegex },
          { estate: searchRegex }
        ];
      }

      // Pagination
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(params.limit) || 20));
      const skip = (page - 1) * limit;

      // Sorting
      let sort = "-createdAt";
      if (params.sort) {
        sort = params.sort;
      } else if (query.rankingScore) {
        sort = "-rankingScore -createdAt";
      }

      // Query database in parallel
      const [properties, total] = await Promise.all([
        AggregatedProperty.find(query)
          .select(LISTING_PROJECTION)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        AggregatedProperty.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      // Return both 'properties' and 'data' fields for maximum compatibility across callers
      return {
        success: true,
        properties,
        data: properties,
        total,
        count: total,
        page,
        limit,
        totalPages
      };
    }, cacheConfig.ttl.searchResults);
  }

  async getNew(limit) {
    return await this.cache.getOrSet(cacheConfig.keys.featured("new_" + limit), async () => {
      return await AggregatedProperty.find({ isPublished: true, availability: "available" })
        .select(LISTING_PROJECTION)
        .sort("-postedDate")
        .limit(limit || 20)
        .lean();
    }, cacheConfig.ttl.popularListings);
  }

  async getFeatured(limit) {
    return await this.cache.getOrSet(cacheConfig.keys.featured(limit || 10), async () => {
      return await AggregatedProperty.find({ isPublished: true, isFeatured: true, availability: "available" })
        .select(LISTING_PROJECTION)
        .sort("-rankingScore")
        .limit(limit || 10)
        .lean();
    }, cacheConfig.ttl.featuredProperties);
  }

  async getVerified(limit) {
    return await this.cache.getOrSet(cacheConfig.keys.verified(limit || 10), async () => {
      return await AggregatedProperty.find({ isPublished: true, verifiedStatus: "verified", availability: "available" })
        .sort("-rankingScore")
        .limit(limit || 10)
        .lean();
    }, cacheConfig.ttl.verifiedProperties);
  }

  async getSimilar(propertyId, limit) {
    const property = await AggregatedProperty.findById(propertyId).lean();
    if (!property) return [];
    const query = { isPublished: true, _id: { $ne: propertyId }, availability: "available" };
    if (property.propertyType) query.propertyType = property.propertyType;
    if (property.county) query.county = property.county;
    if (property.listingType) query.listingType = property.listingType;
    return await AggregatedProperty.find(query)
      .sort("-rankingScore")
      .limit(limit || 10)
      .lean();
  }
}

module.exports = PropertySearchService;