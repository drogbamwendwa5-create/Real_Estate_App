/**
 * Property Update Job
 * Runs every 2 hours to update existing listings.
 */
const cron = require('node-cron');
const schedulerConfig = require('../config/scheduler.config');
const PropertyUpdateService = require('../services/PropertyUpdateService');

class PropertyUpdateJob {
  constructor() {
    this.service = new PropertyUpdateService();
    this.task = null;
    this.isRunning = false;
  }

  start() {
    this.task = cron.schedule(schedulerConfig.schedules.scraperUpdate, async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        console.log('[PropertyUpdateJob] Starting update cycle...');
        const result = await this.service.removeInactive();
        console.log('[PropertyUpdateJob] Update cycle completed:', result);
      } catch (error) {
        console.error('[PropertyUpdateJob] Error:', error.message);
      } finally {
        this.isRunning = false;
      }
    }, { timezone: schedulerConfig.timezone });
  }

  stop() {
    if (this.task) this.task.stop();
  }
}

module.exports = new PropertyUpdateJob();
