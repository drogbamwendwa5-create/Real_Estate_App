/**
 * Property Validation Job
 * Runs every 24 hours to validate all properties.
 */
const cron = require('node-cron');
const schedulerConfig = require('../config/scheduler.config');
const PropertyValidationService = require('../services/PropertyValidationService');

class PropertyValidationJob {
  constructor() {
    this.service = new PropertyValidationService();
    this.task = null;
    this.isRunning = false;
  }

  start() {
    this.task = cron.schedule(schedulerConfig.schedules.validation, async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        console.log('[PropertyValidationJob] Starting validation...');
        const result = await this.service.validateAll(100);
        console.log('[PropertyValidationJob] Validation completed:', result);
      } catch (error) {
        console.error('[PropertyValidationJob] Error:', error.message);
      } finally {
        this.isRunning = false;
      }
    }, { timezone: schedulerConfig.timezone });
  }

  stop() {
    if (this.task) this.task.stop();
  }
}

module.exports = new PropertyValidationJob();
