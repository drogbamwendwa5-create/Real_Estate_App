/**
 * Run the property scraper to populate the database.
 * This script runs every enabled source until its pagination is exhausted.
 * saving all scraped properties directly to the database.
 * Usage: node property-aggregation/run-scraper.js
 */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('../Config/database');
const scraperJob = require('./jobs/PropertyScraperJob');

const runScraper = async () => {
  const startTime = Date.now();
  try {
    console.log('[RunScraper] Connecting to database...');
    await connectDB();
    
    console.log('[RunScraper] Starting all enabled source scrapers with no listing cap...');
    
    // Run the scraper once - it will save properties directly to the database
    // via PropertyImportService which uses AggregatedProperty model
    const results = await scraperJob.runOnce();
    
    const elapsed = Date.now() - startTime;
    console.log('[RunScraper] Scraper completed in', elapsed / 1000, 'seconds');
    console.log('[RunScraper] Results:', JSON.stringify(results, null, 2));
    
    // Log summary of properties found
    let totalFound = 0;
    let totalImported = 0;
    let totalUpdated = 0;
    for (const [key, result] of Object.entries(results)) {
      totalFound += result.listingsFound || 0;
      totalImported += result.listingsImported || 0;
      totalUpdated += result.listingsUpdated || 0;
      console.log(`[RunScraper] ${result.source}: ${result.listingsFound} found, ${result.listingsImported} imported, ${result.listingsUpdated} updated`);
    }
    
    console.log('[RunScraper] Total:', totalFound, 'properties found,', totalImported, 'imported,', totalUpdated, 'updated');
    console.log('[RunScraper] Database updated successfully. Frontend will now fetch from database via API.');
    
    process.exit(0);
  } catch (error) {
    console.error('[RunScraper] Error:', error.message);
    process.exit(1);
  }
};

runScraper();