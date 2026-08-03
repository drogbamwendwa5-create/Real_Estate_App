/**
 * AI Worker - Processes AI enrichment for properties.
 * Enriches properties with amenities, nearby places, classification, and market insights.
 */
const aiQueue = require('../queues/aiQueue');
const rankingQueue = require('../queues/rankingQueue');
const AIEnrichment = require('../services/AIEnrichment');
const LocationService = require('../services/LocationService');
const AggregatedProperty = require('../database/AggregatedProperty');

async function processAI(job) {
  const { property, sourceKey, fingerprint } = job.data;
  console.log(`[AIWorker] Enriching ${property.propertyID || 'unknown'}`);

  try {
    const aiEnricher = new AIEnrichment();
    const locationService = new LocationService();

    // Enrich with location data
    const enrichedWithLocation = await locationService.enrichProperty(property);

    // Enrich with AI data
    const enriched = await aiEnricher.enrich(enrichedWithLocation);

    // Save enriched data to database
    if (enriched._id || enriched.propertyID) {
      const query = enriched._id 
        ? { _id: enriched._id } 
        : { propertyID: enriched.propertyID };
      
      await AggregatedProperty.findOneAndUpdate(query, {
        $set: {
          amenities: enriched.amenities,
          nearbyPlaces: enriched.nearbyPlaces,
          aiCategory: enriched.category,
          features: enriched.features,
          marketInsights: enriched.marketInsights,
          aiEnriched: true,
          aiEnrichedAt: new Date(),
          latitude: enriched.latitude || undefined,
          longitude: enriched.longitude || undefined,
          county: enriched.county || undefined,
          constituency: enriched.constituency || undefined,
          ward: enriched.ward || undefined,
          postalCode: enriched.postalCode || undefined
        }
      });
    }

    // Add to ranking queue for final scoring
    await rankingQueue.addJob({ property: enriched, sourceKey });

    return {
      propertyId: enriched.propertyID,
      amenities: enriched.amenities?.length || 0,
      category: enriched.category,
      hasLocation: !!(enriched.latitude && enriched.longitude)
    };
  } catch (error) {
    console.error('[AIWorker] Error:', error.message);
    // Still try to rank even if AI enrichment fails
    await rankingQueue.addJob({ property, sourceKey });
    throw error;
  }
}

(async () => {
  try {
    const queue = await aiQueue.getQueue();
    if (queue.process) queue.process(processAI);
  } catch (e) { console.warn('[AIWorker] Could not register processor:', e.message); }
})();

module.exports = { processAI };