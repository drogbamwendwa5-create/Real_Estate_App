/**
 * OSRM Routing Configuration
 */

const RoutingConfig = {
  osrmUrl: process.env.OSRM_URL || 'https://router.project-osrm.org',
  profiles: {
    driving: 'driving',
    walking: 'walking',
    cycling: 'cycling',
  },
  timeoutMs: 10000,
  retry: {
    maxRetries: 3,
    retryDelayMs: 1000,
  },
  distanceUnits: 'km',
};

module.exports = Object.freeze(RoutingConfig);
