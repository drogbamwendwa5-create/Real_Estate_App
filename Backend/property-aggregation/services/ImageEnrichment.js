/**
 * ImageEnrichment - Image processing and enrichment service.
 * Downloads, resizes, compresses, creates thumbnails, validates size,
 * and stores metadata for property images.
 */
const axios = require('axios');
const crypto = require('crypto');
const retry = require('../utils/retry');
const ImageValidator = require('./ImageValidator');

class ImageEnrichment {
  constructor() {
    this.validator = new ImageValidator();
    this.thumbnailMaxWidth = 300;
    this.thumbnailMaxHeight = 200;
    this.standardWidth = 1200;
    this.standardHeight = 800;
    this.supportedFormats = ['jpeg', 'png', 'webp'];
  }

  /**
   * Process a single image: download, validate, extract metadata
   * @param {string} imageUrl - The image URL to process
   * @returns {Promise<Object>} Processed image metadata
   */
  async processImage(imageUrl) {
    const result = {
      url: imageUrl,
      originalUrl: imageUrl,
      width: 0,
      height: 0,
      size: 0,
      mimeType: null,
      hash: null,
      thumbnail: null,
      isValid: false,
      error: null
    };

    try {
      // Validate the image first
      const validation = await this.validator.validateImage(imageUrl);
      if (!validation.isValid) {
        result.error = validation.error;
        return result;
      }

      // Download the image
      const buffer = await this.downloadImage(imageUrl);
      result.size = buffer.length;
      result.hash = this.generateHash(buffer);
      result.mimeType = validation.mimeType || this._detectMimeType(buffer);
      result.width = validation.width;
      result.height = validation.height;

      // Create thumbnail (placeholder - in production use sharp)
      result.thumbnail = this._createThumbnailUrl(imageUrl);

      result.isValid = true;
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Download an image with retry logic
   * @param {string} imageUrl 
   * @returns {Promise<Buffer>}
   */
  async downloadImage(imageUrl) {
    return await retry(async () => {
      const response = await axios.get(imageUrl, {
        timeout: 30000,
        responseType: 'arraybuffer',
        maxContentLength: 10 * 1024 * 1024 // 10MB
      });
      return Buffer.from(response.data);
    }, 3, 2000);
  }

  /**
   * Resize an image buffer (placeholder - in production use sharp)
   * @param {Buffer} buffer 
   * @param {number} width 
   * @param {number} height 
   * @returns {Promise<Buffer>}
   */
  async resizeImage(buffer, width, height) {
    // In production, use sharp: sharp(buffer).resize(width, height).toBuffer()
    return buffer;
  }

  /**
   * Compress an image buffer
   * @param {Buffer} buffer 
   * @param {number} quality - 1-100
   * @returns {Promise<Buffer>}
   */
  async compressImage(buffer, quality = 80) {
    // In production, use sharp: sharp(buffer).jpeg({ quality }).toBuffer()
    return buffer;
  }

  /**
   * Create a thumbnail from an image buffer
   * @param {Buffer} buffer 
   * @returns {Promise<Buffer>}
   */
  async createThumbnail(buffer) {
    return await this.resizeImage(buffer, this.thumbnailMaxWidth, this.thumbnailMaxHeight);
  }

  /**
   * Validate image size constraints
   * @param {number} size - File size in bytes
   * @param {number} width - Image width in pixels
   * @param {number} height - Image height in pixels
   * @returns {Object}
   */
  validateSize(size, width, height) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minWidth = 400;
    const minHeight = 300;

    return {
      isValid: size <= maxSize && width >= minWidth && height >= minHeight,
      size,
      width,
      height,
      maxSize,
      minWidth,
      minHeight
    };
  }

  /**
   * Generate a hash for an image buffer
   * @param {Buffer} buffer 
   * @returns {string}
   */
  generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Store image metadata
   * @param {Object} metadata - Image metadata object
   * @returns {Promise<Object>}
   */
  async storeMetadata(metadata) {
    // In production, store in database or file storage
    return {
      ...metadata,
      storedAt: new Date().toISOString(),
      id: crypto.randomUUID()
    };
  }

  /**
   * Process multiple images
   * @param {string[]} imageUrls 
   * @returns {Promise<Object[]>}
   */
  async processImages(imageUrls) {
    const results = await Promise.allSettled(
      imageUrls.map(url => this.processImage(url))
    );
    return results.map((r, i) => r.status === 'fulfilled' ? r.value : {
      url: imageUrls[i],
      isValid: false,
      error: r.reason?.message || 'Processing failed'
    });
  }

  /**
   * Create a thumbnail URL from an image URL
   * @param {string} imageUrl 
   * @returns {string}
   */
  _createThumbnailUrl(imageUrl) {
    // In production, this would return a CDN or local thumbnail URL
    return imageUrl.replace(/\/images\//, '/thumbnails/').replace(/\/photos\//, '/thumbs/');
  }

  /**
   * Detect MIME type from buffer magic bytes
   * @param {Buffer} buffer 
   * @returns {string}
   */
  _detectMimeType(buffer) {
    if (!buffer || buffer.length < 4) return 'application/octet-stream';

    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return 'image/webp';
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
    if (buffer[0] === 0x42 && buffer[1] === 0x4D) return 'image/bmp';
    if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return 'image/x-icon';

    return 'application/octet-stream';
  }
}

module.exports = ImageEnrichment;