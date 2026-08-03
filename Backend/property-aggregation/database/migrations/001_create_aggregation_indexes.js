/**
 * Migration: 001_create_aggregation_indexes
 * Purpose: Ensure all aggregation model indexes are created.
 * This is idempotent and safe to run multiple times.
 */


const mongoose = require('mongoose');

// Import all aggregation models to trigger index creation
const AggregatedProperty = require('../AggregatedProperty');
const PropertySource = require('../PropertySource');
const PropertyDuplicate = require('../PropertyDuplicate');
const PropertyRanking = require('../PropertyRanking');
const PropertyRecommendation = require('../PropertyRecommendation');
const PropertySearchHistory = require('../PropertySearchHistory');
const PropertyView = require('../PropertyView');
const PropertySaved = require('../PropertySaved');
const PropertyPriceHistory = require('../PropertyPriceHistory');
const PropertyValidationLog = require('../PropertyValidationLog');
const PropertyScraperLog = require('../PropertyScraperLog');

// Favourite model (extended with aggregatedProperty)
const Favourite = require('../../../Models/Favourite');

async function runMigration() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Migration] Skipping - database not connected');
      return { success: true, message: 'Database not connected, skipped' };
    }

    console.log('[Migration] Creating indexes for aggregation models...');

    // Ensure indexes for all aggregation models
    const models = [
      { name: 'AggregatedProperty', model: AggregatedProperty },
      { name: 'PropertySource', model: PropertySource },
      { name: 'PropertyDuplicate', model: PropertyDuplicate },
      { name: 'PropertyRanking', model: PropertyRanking },
      { name: 'PropertyRecommendation', model: PropertyRecommendation },
      { name: 'PropertySearchHistory', model: PropertySearchHistory },
      { name: 'PropertyView', model: PropertyView },
      { name: 'PropertySaved', model: PropertySaved },
      { name: 'PropertyPriceHistory', model: PropertyPriceHistory },
      { name: 'PropertyValidationLog', model: PropertyValidationLog },
      { name: 'PropertyScraperLog', model: PropertyScraperLog },
      { name: 'Favourite', model: Favourite },
    ];

    const results = [];
    for (const { name, model } of models) {
      try {
        await model.ensureIndexes();
        const indexes = await model.collection?.indexes?.() || [];
        results.push({ name, indexesCreated: indexes.length, status: 'success' });
        console.log(`[Migration] ✓ ${name} - ${indexes.length} indexes`);
      } catch (err) {
        results.push({ name, status: 'error', error: err.message });
        console.error(`[Migration] ✗ ${name}: ${err.message}`);
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('[Migration] Failed:', error);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  runMigration()
    .then((res) => {
      console.log('[Migration] Result:', res);
      process.exit(res.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Migration] Fatal:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };