/**
 * Image Worker - Processes property image validation and enrichment.
 * Validates images, rejects placeholders, extracts metadata, and adds to duplicate queue.
 */
const imageQueue = require('../queues/imageQueue');
const duplicateQueue = require('../queues/duplicateQueue');
const ImageValidator = require('../services/ImageValidator');
const ImageEnrichment = require('../services/ImageEnrichment');

async function processImage(job) {
  const { property, sourceKey, url } = job.data;
  console.log(`[ImageWorker] Processing images for ${property.propertyID || url}`);

  try {
    const validator = new ImageValidator();
    const enricher = new ImageEnrichment();
    const images = property.images || property.propertyImages || [];

    if (images.length === 0) {
      // Add to duplicate queue directly if no images
      await duplicateQueue.addJob({ property, sourceKey });
      return { propertyId: property.propertyID, imagesValidated: 0 };
    }

    // Extract image URLs
    const imageUrls = images.map(img => typeof img === 'string' ? img : (img.url || img.src || '')).filter(Boolean);

    // Validate all images
    const validationResults = await validator.validateImages(imageUrls);
    const validImages = validationResults.filter(r => r.isValid);
    const invalidImages = validationResults.filter(r => !r.isValid);

    if (validImages.length > 0) {
      // Enrich valid images
      const enriched = await enricher.processImages(validImages.map(r => r.url));
      property.validatedImages = enriched;
      property.validImageCount = enriched.filter(e => e.isValid).length;
      property.invalidImageCount = invalidImages.length;
    }

    property.imageValidationResults = validationResults;
    
    // Add to duplicate queue for next stage
    await duplicateQueue.addJob({ property, sourceKey });
    
    return { 
      propertyId: property.propertyID, 
      validImages: validImages.length, 
      invalidImages: invalidImages.length 
    };
  } catch (error) {
    console.error('[ImageWorker] Error:', error.message);
    // Still pass to duplicate queue even if image processing fails
    await duplicateQueue.addJob({ property, sourceKey });
    throw error;
  }
}

(async () => {
  try {
    const queue = await imageQueue.getQueue();
    if (queue.process) queue.process(processImage);
  } catch (e) { console.warn('[ImageWorker] Could not register processor:', e.message); }
})();

module.exports = { processImage };