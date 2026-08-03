/**
 * Heatmap Configuration
 */

const HeatmapConfig = {
  gridResolution: {
    lowZoom: 1000,
    mediumZoom: 500,
    highZoom: 100,
  },
  colorScales: [
    { threshold: 0, color: 'green' },
    { threshold: 0.5, color: 'yellow' },
    { threshold: 1, color: 'red' }
  ],
  propertyDensityThresholds: {
    low: 5,
    medium: 20,
    high: 50,
  },
  radiusSettings: {
    default: 20,
    min: 10,
    max: 50
  },
  zoomDisplay: {
    minZoom: 8,
    maxZoom: 18,
  },
};

module.exports = Object.freeze(HeatmapConfig);
