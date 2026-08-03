/**
 * ImageValidator - Image validation and quality checking service.
 * Validates property images for quality, authenticity, and format.
 * Rejects placeholders, blanks, 404s, watermarks, logos, and advertisements.
 * Accepts only genuine property photos.
 */
const axios = require('axios');
const retry = require('../utils/retry');
const crypto = require('crypto');

class ImageValidator {
  constructor() {
    this.minWidth = 400;
    this.minHeight = 300;
    this.maxWidth = 4000;
    this.maxHeight = 4000;
    this.minAspectRatio = 0.5;
    this.maxAspectRatio = 2.5;
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.placeholderPatterns = [
      /placeholder/i,
      /no.?image/i,
      /no.?photo/i,
      /no.?picture/i,
      /image.?not.?available/i,
      /photo.?not.?available/i,
      /coming.?soon/i,
      /under.?construction/i,
      /sample.?image/i,
      /dummy.?image/i,
      /blank/i,
      /empty/i,
      /default.?image/i,
      /thumbnail.?default/i,
      /img.?default/i,
      /logo/i,
      /watermark/i,
      /advertisement/i,
      /sponsored/i,
      /ad\.(jpg|png|gif|webp)/i,
      /banner/i,
      /promotion/i
    ];
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    ];
  }

  /**
   * Validate a single image URL
   * @param {string} imageUrl - The image URL to validate
   * @param {Object} options - Validation options
   * @param {boolean} options.checkResolution - Whether to check image resolution (default: true)
   * @param {boolean} options.download - Whether to download and check the image (default: true)
   * @returns {Promise<Object>} Validation result
   */
  async validateImage(imageUrl, options = {}) {
    const result = {
      url: imageUrl,
      isValid: false,
      isPlaceholder: false,
      isWatermark: false,
      isLogo: false,
      isAd: false,
      isBroken: false,
      width: 0,
      height: 0,
      size: 0,
      mimeType: null,
      error: null
    };

    try {
      // Check URL against placeholder patterns
      const urlCheck = this._checkUrlPatterns(imageUrl);
      if (urlCheck.isPlaceholder) {
        result.isPlaceholder = true;
        result.error = 'URL matches placeholder pattern';
        return result;
      }

      if (options.download !== false) {
        // Download image headers to check
        const response = await retry(async () => {
          return await axios.head(imageUrl, {
            timeout: 10000,
            responseType: 'stream'
          });
        }, 3, 1000);

        const contentType = response.headers['content-type'];
        const contentLength = parseInt(response.headers['content-length'] || '0', 10);

        // Check content type
        if (contentType && !this.allowedMimeTypes.includes(contentType)) {
          result.error = `Invalid mime type: ${contentType}`;
          return result;
        }
        result.mimeType = contentType;

        // Check file size
        if (contentLength > this.maxFileSize) {
          result.error = `File too large: ${contentLength} bytes`;
          return result;
        }
        result.size = contentLength;

        // Check if 404 or broken
        if (response.status >= 400) {
          result.isBroken = true;
          result.error = `HTTP ${response.status}`;
          return result;
        }
      }

      // Check resolution if requested
      if (options.checkResolution !== false) {
        const resolution = await this.validateResolution(imageUrl);
        result.width = resolution.width;
        result.height = resolution.height;

        if (!resolution.isValid) {
          result.error = resolution.error;
          return result;
        }

        // Check aspect ratio
        const aspectCheck = this.checkAspectRatio(resolution.width, resolution.height);
        if (!aspectCheck.isValid) {
          result.error = aspectCheck.error;
          return result;
        }
      }

      result.isValid = true;
    } catch (error) {
      result.isBroken = true;
      result.error = error.message;
    }

    return result;
  }

  /**
   * Check if an image URL matches placeholder/watermark/logo patterns
   * @param {string} imageUrl 
   * @returns {Object}
   */
  _checkUrlPatterns(imageUrl) {
    const result = { isPlaceholder: false, isWatermark: false, isLogo: false, isAd: false };

    for (const pattern of this.placeholderPatterns) {
      if (pattern.test(imageUrl)) {
        if (/watermark/i.test(imageUrl)) result.isWatermark = true;
        if (/logo/i.test(imageUrl)) result.isLogo = true;
        if (/ad|banner|sponsored|promotion/i.test(imageUrl)) result.isAd = true;
        result.isPlaceholder = true;
        break;
      }
    }

    return result;
  }

  /**
   * Check if an image is a placeholder
   * @param {string} imageUrl 
   * @returns {Promise<boolean>}
   */
  async isPlaceholder(imageUrl) {
    const result = await this.validateImage(imageUrl, { checkResolution: false, download: false });
    return result.isPlaceholder || result.isWatermark || result.isLogo || result.isAd;
  }

  /**
   * Download an image and return its buffer
   * @param {string} imageUrl 
   * @returns {Promise<Buffer>}
   */
  async downloadImage(imageUrl) {
    return await retry(async () => {
      const response = await axios.get(imageUrl, {
        timeout: 30000,
        responseType: 'arraybuffer'
      });
      return Buffer.from(response.data);
    }, 3, 2000);
  }

  /**
   * Compress an image buffer
   * @param {Buffer} buffer - Image buffer
   * @param {number} quality - JPEG quality (1-100, default: 80)
   * @returns {Promise<Buffer>}
   */
  async compressImage(buffer, quality = 80) {
    // For now, return the buffer as-is.
    // In production, use sharp or jimp for actual compression.
    return buffer;
  }

  /**
   * Validate image resolution
   * @param {string} imageUrl 
   * @returns {Promise<Object>}
   */
  async validateResolution(imageUrl) {
    const result = { width: 0, height: 0, isValid: false, error: null };

    try {
      const response = await retry(async () => {
        return await axios.get(imageUrl, {
          timeout: 15000,
          responseType: 'arraybuffer',
          maxContentLength: 5 * 1024 * 1024 // 5MB
        });
      }, 3, 1000);

      const buffer = Buffer.from(response.data);
      
      // Try to get dimensions from buffer headers
      const dimensions = this._getImageDimensions(buffer);
      result.width = dimensions.width;
      result.height = dimensions.height;

      if (dimensions.width < this.minWidth || dimensions.height < this.minHeight) {
        result.error = `Image too small: ${dimensions.width}x${dimensions.height} (min: ${this.minWidth}x${this.minHeight})`;
        return result;
      }

      if (dimensions.width > this.maxWidth || dimensions.height > this.maxHeight) {
        result.error = `Image too large: ${dimensions.width}x${dimensions.height} (max: ${this.maxWidth}x${this.maxHeight})`;
        return result;
      }

      result.isValid = true;
    } catch (error) {
      result.error = `Failed to validate resolution: ${error.message}`;
    }

    return result;
  }

  /**
   * Check image aspect ratio
   * @param {number} width 
   * @param {number} height 
   * @returns {Object}
   */
  checkAspectRatio(width, height) {
    const ratio = width / height;
    const result = { ratio, isValid: true, error: null };

    if (ratio < this.minAspectRatio || ratio > this.maxAspectRatio) {
      result.isValid = false;
      result.error = `Aspect ratio out of range: ${ratio.toFixed(2)} (allowed: ${this.minAspectRatio}-${this.maxAspectRatio})`;
    }

    return result;
  }

  /**
   * Get image dimensions from buffer headers
   * @param {Buffer} buffer 
   * @returns {Object}
   */
  _getImageDimensions(buffer) {
    // Simple JPEG/PNG dimension extraction
    let width = 0;
    let height = 0;

    try {
      // Check JPEG
      if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        let offset = 2;
        while (offset < buffer.length) {
          if (buffer[offset] === 0xFF && buffer[offset + 1] === 0xC0) {
            height = (buffer[offset + 5] << 8) + buffer[offset + 6];
            width = (buffer[offset + 7] << 8) + buffer[offset + 8];
            break;
          }
          offset += 2 + (buffer[offset + 2] << 8) + buffer[offset + 3];
        }
      }
      // Check PNG
      else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        width = (buffer[16] << 24) + (buffer[17] << 16) + (buffer[18] << 8) + buffer[19];
        height = (buffer[20] << 24) + (buffer[21] << 16) + (buffer[22] << 8) + buffer[23];
      }
      // Check WebP
      else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
        // VP8X or VP8L
        if (buffer[12] === 0x56 && buffer[13] === 0x50) {
          width = 1 + ((buffer[26] | (buffer[27] << 8)) & 0x3FFF);
          height = 1 + ((buffer[28] | (buffer[29] << 8)) & 0x3FFF);
        }
      }
    } catch (e) {
      // Fallback: return 0 dimensions
    }

    return { width, height };
  }

  /**
   * Generate a hash for an image
   * @param {Buffer} buffer 
   * @returns {string}
   */
  generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Validate multiple images
   * @param {string[]} imageUrls 
   * @returns {Promise<Object[]>}
   */
  async validateImages(imageUrls) {
    const results = await Promise.allSettled(
      imageUrls.map(url => this.validateImage(url))
    );
    return results.map((r, i) => r.status === 'fulfilled' ? r.value : {
      url: imageUrls[i],
      isValid: false,
      error: r.reason?.message || 'Validation failed'
    });
  }

  /**
   * Get the configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      maxWidth: this.maxWidth,
      maxHeight: this.maxHeight,
      minAspectRatio: this.minAspectRatio,
      maxAspectRatio: this.maxAspectRatio,
      maxFileSize: this.maxFileSize,
      allowedMimeTypes: this.allowedMimeTypes
    };
  }
}

module.exports = ImageValidator;