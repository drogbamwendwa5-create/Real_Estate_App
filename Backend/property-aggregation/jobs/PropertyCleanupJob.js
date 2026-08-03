/**
 * Property Cleanup Job
 * Runs every 24 hours to clean up inactive listings and stale data.
 */
const cron = require('node-cron');
const schedulerConfig = require('../config/scheduler.config');
const PropertyUpdateService = require('../services/PropertyUpdateService');
const PropertyImageService = require('../services/PropertyImageService');
const DuplicateDetector = require('../duplicates/DuplicateDetector');

class PropertyCleanupJob {
  constructor() {
    this.updateService = new PropertyUpdateService();
    this.imageService = new PropertyImageService();
    this.duplicateDetector = new DuplicateDetector();
    this.task = null;
    this.isRunning = false;
  }

  start() {
    this.task = cron.schedule(schedulerConfig.schedules.cleanup, async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        console.log('[PropertyCleanupJob] Starting cleanup...');
        const inactive = await this.updateService.removeInactive();
        const duplicates = await this.duplicateDetector.mergeDuplicates();
        console.log('[PropertyCleanupJob] Cleanup completed:', { inactive, duplicates });
      } catch (error) {
        console.error('[PropertyCleanupJob] Error:', error.message);
      } finally {
        this.isRunning = false;
      }
    }, { timezone: schedulerConfig.timezone });
  }

  stop() {
    if (this.task) this.task.stop();
  }
}

module.exports = new PropertyCleanupJob();
