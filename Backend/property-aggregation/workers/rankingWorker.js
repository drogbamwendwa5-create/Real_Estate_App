/**
 * Ranking Worker - Processes property ranking calculations.
 * Calculates a 0-100 ranking score for each property.
 */
const rankingQueue = require('../queues/rankingQueue');
const importQueue = require('../queues/importQueue');
const RankingEngine = require('../services/RankingEngine');
const AggregatedProperty = require('../database/AggregatedProperty');

async function processRanking(job) {
  const { property, sourceKey } = job.data;
  console.log(`[RankingWorker] Ranking ${property.propertyID || 'unknown'}`);

  try {
    const engine = new RankingEngine();
    const rankingResult = engine.rank(property);

    // Update the property in the database with ranking score
    if (property._id || property.propertyID) {
      const query = property._id 
        ? { _id: property._id } 
        : { propertyID: property.propertyID };
      
      await AggregatedProperty.findOneAndUpdate(query, {
        $set: {
          rankingScore: rankingResult.score,
          rankingLabel: rankingResult.label,
          rankingBreakdown: rankingResult.breakdown,
          lastRanked: new Date()
        }
      });
    }

    property.rankingScore = rankingResult.score;
    property.rankingLabel = rankingResult.label;

    // Add to import queue for final database import
    // This completes the pipeline: crawl -> listing -> detail -> image -> duplicate -> AI -> ranking -> import
    await importQueue.addJob({
      property,
      sourceKey,
      rankingResult
    });

    return {
      propertyId: property.propertyID,
      score: rankingResult.score,
      label: rankingResult.label,
      breakdown: rankingResult.breakdown
    };
  } catch (error) {
    console.error('[RankingWorker] Error:', error.message);
    throw error;
  }
}

(async () => {
  try {
    const queue = await rankingQueue.getQueue();
    if (queue.process) queue.process(processRanking);
  } catch (e) { console.warn('[RankingWorker] Could not register processor:', e.message); }
})();

module.exports = { processRanking };