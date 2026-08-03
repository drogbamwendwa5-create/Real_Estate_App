/**
 * Listing Worker - Processes listing URLs from the listing queue.
 * Extracts listing URLs from scraped pages and adds them to the detail queue.
 */
const listingQueue = require('../queues/listingQueue');
const detailQueue = require('../queues/detailQueue');
const CacheManager = require('../services/CacheManager');

async function processListing(job) {
  const { sourceKey, listingUrls, sourceConfig } = job.data;
  console.log(`[ListingWorker] Processing ${listingUrls.length} listings from ${sourceKey}`);

  let processed = 0;
  let skipped = 0;

  for (const url of listingUrls) {
    try {
      // Check if URL was already visited
      const visited = await CacheManager.isUrlVisited(url);
      if (visited) {
        skipped++;
        continue;
      }

      // Add to detail queue for full scraping
      await detailQueue.addJob({
        sourceKey,
        url,
        sourceConfig
      });

      // Mark as visited
      await CacheManager.cacheVisitedUrl(url);
      processed++;
    } catch (error) {
      console.error(`[ListingWorker] Error processing ${url}:`, error.message);
    }
  }

  console.log(`[ListingWorker] ${sourceKey}: ${processed} queued, ${skipped} skipped`);
  return { processed, skipped, sourceKey };
}

// Register processor
(async () => {
  try {
    const queue = await listingQueue.getQueue();
    if (queue.process) {
      queue.process(processListing);
    }
  } catch (e) {
    console.warn('[ListingWorker] Could not register processor:', e.message);
  }
})();

module.exports = { processListing };