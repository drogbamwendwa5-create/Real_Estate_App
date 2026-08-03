/**
 * Property Aggregation Scheduler
 * Initializes and manages all cron jobs.
 */
const scraperJob = require('./PropertyScraperJob');
const updateJob = require('./PropertyUpdateJob');
const rankingJob = require('./PropertyRankingJob');
const validationJob = require('./PropertyValidationJob');
const cleanupJob = require('./PropertyCleanupJob');
const schedulerConfig = require('../config/scheduler.config');

class PropertyScheduler {
  constructor() {
    this.jobs = {
      scraper: scraperJob,
      update: updateJob,
      ranking: rankingJob,
      validation: validationJob,
      cleanup: cleanupJob,
    };
  }

  start() {
    if (process.env.NODE_ENV === 'production' || schedulerConfig.runOnStartup) {
      Object.values(this.jobs).forEach(job => job.start());
      console.log('[PropertyScheduler] All jobs started');
    } else {
      console.log('[PropertyScheduler] Jobs not started (development mode)');
    }
  }

  stop() {
    Object.values(this.jobs).forEach(job => job.stop());
    console.log('[PropertyScheduler] All jobs stopped');
  }

  getJobs() {
    return Object.keys(this.jobs);
  }
}

module.exports = new PropertyScheduler();
