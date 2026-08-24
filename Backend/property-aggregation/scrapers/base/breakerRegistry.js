/**
 * Shared registry for circuit breakers, scoped per scraper source.
 * Centralized so the aggregator can snapshot all breakers at once.
 */
const { createBreakerRegistry } = require("../../utils/circuitBreaker");

let registry = null;

function getBreakerRegistry(opts) {
  if (!registry) {
    registry = createBreakerRegistry({
      failureThreshold: 5,
      cooldownMs: 5 * 60 * 1000,
      ...(opts || {}),
    });
  }
  return registry;
}

function resetBreakerRegistry() {
  registry = null;
}

module.exports = { getBreakerRegistry, resetBreakerRegistry };
