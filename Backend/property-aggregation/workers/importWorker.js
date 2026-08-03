/**
 * Import Worker - Processes final database imports.
 * Receives ranked properties from the ranking queue and imports them to the database.
 * This is the final step in the pipeline:
 * crawl -> listing -> detail -> image -> duplicate -> AI -> ranking -> IMPORT
 */
const importQueue = require('../queues/importQueue');
const PropertyImportService = require('../services/PropertyImportService');

async function processImport(job) {
  const { property, sourceKey, rankingResult } = job.data;
  console.log(`[ImportWorker] Importing ${property.propertyID || 'unknown'} to database`);

  try {
    const importService = new PropertyImportService();
    
    // Import the property to the database
    const result = await importService.processProperty(property, sourceKey);
    
    if (result.success) {
      console.log(`[ImportWorker] ${property.propertyID}: ${result.isUpdate ? 'updated' : 'imported'} successfully`);
    } else {
      console.warn(`[ImportWorker] ${property.propertyID}: import failed - ${result.error}`);
    }

    return {
      propertyId: property.propertyID,
      success: result.success,
      isUpdate: result.isUpdate,
      error: result.error
    };
  } catch (error) {
    console.error('[ImportWorker] Error:', error.message);
    throw error;
  }
}

(async () => {
  try {
    const queue = await importQueue.getQueue();
    if (queue.process) queue.process(processImport);
  } catch (e) { console.warn('[ImportWorker] Could not register processor:', e.message); }
})();

module.exports = { processImport };