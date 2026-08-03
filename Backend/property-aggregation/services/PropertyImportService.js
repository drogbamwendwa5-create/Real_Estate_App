/**
 * Property Import Service
 * Batch import of properties from various data sources.
 * Ensures all properties have valid images before saving to the database.
 */
const AggregatedProperty = require('../database/AggregatedProperty');
const sc = require('../config/source.config');

class PropertyImportService {
  async import(properties, sourceName) {
    if (!Array.isArray(properties)) {
      return { imported: 0, updated: 0, failed: 0 };
    }
    return await this.importFromArray(properties, sourceName);
  }

  /**
   * Ensure a property has at least one valid image.
   * If no images are found, attempt to add a placeholder.
   */
  ensureImages(property) {
    const hasPropertyImages = property.propertyImages && 
      Array.isArray(property.propertyImages) && 
      property.propertyImages.length > 0 &&
      property.propertyImages.some(img => img && img.url);
    
    const hasImages = property.images && 
      Array.isArray(property.images) && 
      property.images.length > 0 &&
      property.images.some(img => {
        if (typeof img === 'string') return img;
        return img && (img.url || img.src);
      });

    if (!hasPropertyImages && !hasImages) {
      const placeholder = 'https://via.placeholder.com/600x400?text=No+Image+Available';
      property.propertyImages = [{ url: placeholder, isFeatured: true, isValid: true }];
      property.images = [placeholder];
    }
    
    return property;
  }

  async processProperty(property, sourceName) {
    if (!property || !property.propertyID) {
      return { success: false, error: 'Invalid property data' };
    }

    property = this.ensureImages(property);

    property.sourceName = property.sourceName || sourceName;
    property.lastUpdated = new Date();
    property.importedAt = new Date();

    // Add new fields for enhanced tracking
    if (property.rankingScore === undefined) property.rankingScore = 0;
    if (property.duplicateScore === undefined) property.duplicateScore = 0;
    if (property.aiValidationScore === undefined) property.aiValidationScore = 0;
    if (property.validationScore === undefined) property.validationScore = 0;
    if (property.daysOnMarket === undefined && property.postedDate) {
      property.daysOnMarket = Math.floor((Date.now() - new Date(property.postedDate).getTime()) / (1000 * 60 * 60 * 24));
    }
    if (property.views === undefined) property.views = 0;
    if (property.saves === undefined) property.saves = 0;
    if (property.isPublished === undefined) property.isPublished = true;
    if (property.sourceCategory === undefined) property.sourceCategory = sc.sources[sourceName]?.category || 'listing';

    // Store source URL
    if (property.sourceURL) {
      property.sourceURLs = [property.sourceURL];
    }

    // Track price history
    if (property.price) {
      property.priceHistory = [{
        price: property.price,
        date: new Date(),
        source: sourceName
      }];
    }

    // Track listing history
    property.listingHistory = [{
      status: 'imported',
      date: new Date(),
      source: sourceName
    }];

    try {
      const existing = await AggregatedProperty.findOne({ propertyID: property.propertyID });
      if (existing) {
        // Update price history if price changed
        if (property.price && property.price !== existing.price) {
          const existingHistory = existing.priceHistory || [];
          property.priceHistory = [
            ...existingHistory,
            { price: property.price, date: new Date(), source: sourceName }
          ];
        } else {
          property.priceHistory = existing.priceHistory || property.priceHistory;
        }

        // Merge listing history
        const existingListingHistory = existing.listingHistory || [];
        property.listingHistory = [
          ...existingListingHistory,
          { status: 'updated', date: new Date(), source: sourceName }
        ];

        await AggregatedProperty.findOneAndUpdate(
          { propertyID: property.propertyID },
          { ...property },
          { new: true, runValidators: true }
        );
        return { success: true, isUpdate: true };
      }

      await AggregatedProperty.create({ ...property });
      return { success: true, isUpdate: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async importBatch(properties, sourceName) {
    if (!Array.isArray(properties) || properties.length === 0) {
      return { imported: 0, updated: 0, failed: 0 };
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;

    // Clean and validate propertyIDs
    const validProperties = [];
    const seenKeys = new Set();
    for (const property of properties) {
      if (!property || !property.propertyID) continue;
      const sourceUrl = property.sourceURL ? String(property.sourceURL).split("#")[0].replace(/\/$/,"").toLowerCase() : "";
      const key = sourceUrl ? "url:"+sourceUrl : "id:"+property.propertyID;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      validProperties.push(property);
    }
    failed += (properties.length - validProperties.length);

    if (validProperties.length === 0) {
      return { imported, updated, failed };
    }

    // Chunk size for bulkWrite to prevent memory/payload limits
    const chunkSize = 2500;
    for (let i = 0; i < validProperties.length; i += chunkSize) {
      const chunk = validProperties.slice(i, i + chunkSize);
      const propertyIDs = chunk.map(p => p.propertyID);

      try {
        // Fetch existing entries in this chunk
        const existingListings = await AggregatedProperty.find({ propertyID: { $in: propertyIDs } }).lean();
        const existingMap = new Map(existingListings.map(p => [p.propertyID, p]));

        const operations = [];

        for (let property of chunk) {
          property = this.ensureImages(property);
          property.sourceName = property.sourceName || sourceName;
          property.lastUpdated = new Date();
          property.importedAt = new Date();

          if (property.rankingScore === undefined) property.rankingScore = 0;
          if (property.duplicateScore === undefined) property.duplicateScore = 0;
          if (property.aiValidationScore === undefined) property.aiValidationScore = 0;
          if (property.validationScore === undefined) property.validationScore = 0;
          if (property.daysOnMarket === undefined && property.postedDate) {
            property.daysOnMarket = Math.floor((Date.now() - new Date(property.postedDate).getTime()) / (1000 * 60 * 60 * 24));
          }
          if (property.views === undefined) property.views = 0;
          if (property.saves === undefined) property.saves = 0;
          if (property.isPublished === undefined) property.isPublished = true;
          if (property.sourceCategory === undefined) {
            property.sourceCategory = sc.sources[sourceName]?.category || 'listing';
          }

          if (property.sourceURL) {
            property.sourceURLs = [property.sourceURL];
          }

          const existing = existingMap.get(property.propertyID);

          if (existing) {
            // Update price history if price changed
            if (property.price && property.price !== existing.price) {
              const existingHistory = existing.priceHistory || [];
              property.priceHistory = [
                ...existingHistory,
                { price: property.price, date: new Date(), source: sourceName }
              ];
            } else {
              property.priceHistory = existing.priceHistory || [
                { price: property.price || 0, date: new Date(), source: sourceName }
              ];
            }

            // Merge listing history
            const existingListingHistory = existing.listingHistory || [];
            property.listingHistory = [
              ...existingListingHistory,
              { status: 'updated', date: new Date(), source: sourceName }
            ];

            updated++;
            operations.push({
              updateOne: {
                filter: { propertyID: property.propertyID },
                update: { $set: property }
              }
            });
          } else {
            if (property.price) {
              property.priceHistory = [{
                price: property.price,
                date: new Date(),
                source: sourceName
              }];
            }
            property.listingHistory = [{
              status: 'imported',
              date: new Date(),
              source: sourceName
            }];

            imported++;
            operations.push({
              updateOne: {
                filter: { propertyID: property.propertyID },
                update: { $set: property },
                upsert: true
              }
            });
          }
        }

        if (operations.length > 0) {
          await AggregatedProperty.bulkWrite(operations, { ordered: false });
        }
      } catch (error) {
        console.error(`[PropertyImportService] Bulk import failed for chunk ${i}:`, error.message);
        failed += chunk.length;
      }
    }

    return { imported, updated, failed };
  }

  async importFromFile(filePath, sourceName) {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return await this.importBatch(data, sourceName);
  }

  async importFromArray(properties, sourceName) {
    return await this.importBatch(properties, sourceName);
  }
}

module.exports = PropertyImportService;