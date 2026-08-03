/**
 * Property Scraper Job
 * Runs every 2 hours to scrape new listings and updates.
 */
const cron = require('node-cron');
const schedulerConfig = require('../config/scheduler.config');
const PropertyAggregatorService = require('../services/PropertyAggregatorService');

class PropertyScraperJob {
  constructor() {
    this.aggregator = new PropertyAggregatorService();
    this.task = null;
    this.isRunning = false;
  }

  start() {
    this.task = cron.schedule(
      schedulerConfig.schedules.scraperUpdate,
      async () => {
        if (this.isRunning) return;
        this.isRunning = true;
        try {
          console.log('[PropertyScraperJob] Starting scrape cycle...');
          const results = await this.aggregator.aggregateAllSources();
          console.log('[PropertyScraperJob] Scrape cycle completed:', results);
        } catch (error) {
          console.error('[PropertyScraperJob] Error:', error.message);
        } finally {
          this.isRunning = false;
        }
      },
      { timezone: schedulerConfig.timezone }
    );
    console.log('[PropertyScraperJob] Scheduled for:', schedulerConfig.schedules.scraperUpdate);
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('[PropertyScraperJob] Stopped');
    }
  }

  async runOnce(options = {}) {
    return await this.aggregator.aggregateAllSources(options);
  }
}

module.exports = new PropertyScraperJob();
