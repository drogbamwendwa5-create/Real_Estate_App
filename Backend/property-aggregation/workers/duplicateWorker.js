/**
 * Duplicate Worker - Processes duplicate detection for properties.
 * Uses DuplicateEngine to check if a property is a duplicate and merges if needed.
 */
const duplicateQueue = require('../queues/duplicateQueue');
const aiQueue = require('../queues/aiQueue');
const DuplicateEngine = require('../services/DuplicateEngine');
const AggregatedProperty = require('../database/AggregatedProperty');

async function processDuplicate(job) {
  const { property, sourceKey } = job.data;
  console.log(`[DuplicateWorker] Checking duplicates for ${property.propertyID || 'unknown'}`);

  try {
    const engine = new DuplicateEngine();
    const fingerprint = engine.generateFingerprint(property);

    // Find potential duplicates in the database
    const existingProperties = await AggregatedProperty.find({
      $or: [
        { title: { $regex: property.title?.substring(0, 20) || '', $options: 'i' } },
        { price: property.price },
        { sourceURL: property.sourceURL }
      ]
    }).limit(20).lean();

    if (existingProperties.length > 0) {
      const duplicateCheck = engine.findDuplicate(property, existingProperties);
      
      if (duplicateCheck.isDuplicate && duplicateCheck.bestMatch) {
        // Merge with the best match
        const primary = duplicateCheck.bestMatch.property;
        const merged = engine.merge(primary, property);
        
        await AggregatedProperty.findOneAndUpdate(
          { _id: primary._id },
          { $set: merged },
          { new: true }
        );
        
        property.duplicateScore = duplicateCheck.bestMatch.similarity;
        property.mergedInto = primary._id;
        property.isDuplicate = true;
        
        console.log(`[DuplicateWorker] ${property.propertyID} merged with ${primary.propertyID} (${(duplicateCheck.bestMatch.similarity * 100).toFixed(0)}% match)`);
      }
    }

    // Add to AI queue for enrichment
    await aiQueue.addJob({ property, sourceKey, fingerprint });
    
    return { propertyId: property.propertyID, isDuplicate: property.isDuplicate || false };
  } catch (error) {
    console.error('[DuplicateWorker] Error:', error.message);
    await aiQueue.addJob({ property, sourceKey });
    throw error;
  }
}

(async () => {
  try {
    const queue = await duplicateQueue.getQueue();
    if (queue.process) queue.process(processDuplicate);
  } catch (e) { console.warn('[DuplicateWorker] Could not register processor:', e.message); }
})();

module.exports = { processDuplicate };