/**
 * Property Aggregation System - Scheduler Configuration
 * 
 * Cron schedules for scraping, updates, ranking, validation, and cleanup jobs.
 * 
 * Scheduler intervals:
 * - 30 minutes: new listings (quick check)
 * - 6 hours: all listings (full refresh)
 * - 24 hours: revalidation
 * - Weekly: historical updates
 */
module.exports = {
  // Scraper schedules (cron expressions)
  schedules: {
    // Every 30 minutes - quick check for new listings
    newListings: '*/30 * * * *',

    // Every 2 hours - standard listing updates
    scraperUpdate: '0 */2 * * *',

    // Every 6 hours - full listing refresh
    fullRefresh: '0 */6 * * *',

    // Every 6 hours - ranking updates
    ranking: '0 */6 * * *',

    // Every 12 hours - duplicate detection
    duplicateDetection: '0 */12 * * *',

    // Every 12 hours - AI enrichment
    aiEnrichment: '0 */12 * * *',

    // Every 24 hours at 2 AM - validation
    validation: '0 2 * * *',

    // Every 24 hours at 3 AM - cleanup
    cleanup: '0 3 * * *',

    // Every 24 hours at 4 AM - image validation
    imageValidation: '0 4 * * *',

    // Every 24 hours at 5 AM - revalidation
    revalidation: '0 5 * * *',

    // Every 12 hours - cache warmup
    cacheWarmup: '0 */12 * * *',

    // Every 1 hour - price history snapshot
    priceHistory: '0 * * * *',

    // Weekly on Sunday at 6 AM - historical updates
    historicalUpdate: '0 6 * * 0',
  },

  // Job concurrency limits
  concurrency: {
    scraper: 3,        // Max 3 concurrent scrapers
    validator: 5,      // Max 5 concurrent validation tasks
    imageValidator: 10, // Max 10 concurrent image checks
    duplicateDetector: 2, // Max 2 concurrent duplicate detection runs
    aiEnricher: 3,     // Max 3 concurrent AI enrichment tasks
    rankingCalculator: 5, // Max 5 concurrent ranking calculations
  },

  // Job timeouts (in milliseconds)
  timeouts: {
    scraper: 0,            // No scraper runtime cap
    validation: 600000,    // 10 minutes for full validation run
    imageValidation: 900000, // 15 minutes for image validation
    duplicateDetection: 1200000, // 20 minutes for duplicate detection
    aiEnrichment: 600000,  // 10 minutes for AI enrichment
    ranking: 300000,       // 5 minutes for ranking
    cleanup: 600000,       // 10 minutes for cleanup
    cacheWarmup: 120000,   // 2 minutes for cache warmup
    priceHistory: 60000,   // 1 minute for price history snapshot
  },

  // Retry configuration
  retries: {
    maxAttempts: 3,
    backoffMs: 5000,
    backoffMultiplier: 2,
  },

  // Queue processing configuration
  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true' || false,
    batchSize: 50,        // Number of items per batch
    pollInterval: 5000,   // Poll queue every 5 seconds
  },

  // Timezone for cron jobs
  timezone: 'Africa/Nairobi',

  // Whether to run jobs on startup (for development)
  runOnStartup: process.env.RUN_ON_STARTUP === 'true' || false,
};