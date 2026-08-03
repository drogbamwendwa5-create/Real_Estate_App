/**
 * Random delay utility for request throttling.
 * Adds jitter between requests to avoid detection patterns.
 * 
 * @param {number} min - Minimum delay in ms (default: 1000)
 * @param {number} max - Maximum delay in ms (default: 3000)
 * @returns {Promise<void>}
 */
module.exports = async function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};