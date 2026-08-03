/**
 * Property Ranking Job
 * Runs every 6 hours to update property rankings.
 */
const cron = require('node-cron');
const schedulerConfig = require('../config/scheduler.config');
const PropertyRankingService = require('../ranking/PropertyRankingService');

class PropertyRankingJob {
  constructor() {
    this.service = new PropertyRankingService();
    this.task = null;
    this.isRunning = false;
  }

  start() {
    this.task = cron.schedule(schedulerConfig.schedules.ranking, async () => {
      if (this.isRunning) return;
      this.isRunning = true;
      try {
        console.log('[PropertyRankingJob] Starting ranking update...');
        const result = await this.service.updateAllRankings();
        console.log('[PropertyRankingJob] Ranking update completed:', result);
      } catch (error) {
        console.error('[PropertyRankingJob] Error:', error.message);
      } finally {
        this.isRunning = false;
      }
    }, { timezone: schedulerConfig.timezone });
  }

  stop() {
    if (this.task) this.task.stop();
  }
}

module.exports = new PropertyRankingJob();
