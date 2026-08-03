/**
 * Retry utility for axios requests and other async operations.
 * Implements exponential backoff with configurable retries.
 * 
 * @param {Function} fn - The async function to retry
 * @param {number} retries - Maximum number of retry attempts (default: 5)
 * @param {number} delay - Base delay in ms between retries (default: 2000)
 * @returns {Promise<any>} The result of the successful function call
 * @throws {Error} The last error if all retries are exhausted
 */
module.exports = async function retry(fn, retries = 5, delay = 2000) {
  let lastError = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === retries - 1) {
        throw error;
      }

      const waitTime = delay * (i + 1);
      console.warn(`[Retry] Attempt ${i + 1}/${retries} failed: ${error.message}. Waiting ${waitTime}ms before retry...`);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};