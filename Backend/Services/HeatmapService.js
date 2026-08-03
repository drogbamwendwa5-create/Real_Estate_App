const Property = require('../Models/Property');
const HeatmapConfig = require('../Config/HeatmapConfig'); // Might be optional based on actual impl

/**
 * Service for generating map heatmap data layers
 */
class HeatmapService {
  /**
   * Generates heatmap data aggregating properties into grid cells
   * @param {Object} bounds - { north, south, east, west }
   * @param {string} type - 'density' | 'price' | 'investment'
   * @param {number} zoom - Map zoom level
   * @returns {Promise<Object>} Heatmap grid cells and metadata
   */
  async generateHeatmapData(bounds, type = 'density', zoom = 10) {
    try {
      console.log(`[HeatmapService] Generating ${type} heatmap at zoom ${zoom}`);
      const { north, south, east, west } = bounds;
      
      // Get base data within bounds
      const query = {
        'location.coordinates': {
          $geoWithin: {
            $box: [
              [Number(west), Number(south)],
              [Number(east), Number(north)]
            ]
          }
        }
      };

      // Determine grid resolution based on zoom (higher zoom = finer grid)
      // Note: MongoDB aggregation for dynamic spatial grids is complex, 
      // a simple map-reduce style in JS or static aggregation bucketing is used here.
      const properties = await Property.find(query)
        .select('location price')
        .lean();

      // Dynamic grid resolution (N x N cells)
      const gridResolution = Math.max(5, Math.min(zoom * 2, 50));
      const latStep = (north - south) / gridResolution;
      const lngStep = (east - west) / gridResolution;

      const gridMap = new Map();
      let globalMin = Infinity;
      let globalMax = -Infinity;

      properties.forEach(prop => {
        if (!prop.location || !prop.location.coordinates) return;
        const [lng, lat] = prop.location.coordinates;
        
        const gridX = Math.floor((lng - west) / lngStep);
        const gridY = Math.floor((lat - south) / latStep);
        const cellId = `${gridX}-${gridY}`;

        if (!gridMap.has(cellId)) {
          gridMap.set(cellId, {
            lat: south + (gridY * latStep) + (latStep / 2),
            lng: west + (gridX * lngStep) + (lngStep / 2),
            count: 0,
            sumValue: 0
          });
        }

        const cell = gridMap.get(cellId);
        cell.count += 1;

        if (type === 'price' && prop.price) {
          cell.sumValue += prop.price;
        } else if (type === 'investment') {
          // Placeholder: in a real scenario we'd pre-calculate investment scores
          // and index them, here we'll mock based on price/location heuristic
          cell.sumValue += (prop.price || 0) * 0.05; // Mock
        }
      });

      // Process cells and calculate intensity
      let gridCells = Array.from(gridMap.values()).map(cell => {
        let value = 0;
        if (type === 'density') {
          value = cell.count;
        } else {
          value = cell.count > 0 ? cell.sumValue / cell.count : 0;
        }

        globalMin = Math.min(globalMin, value);
        globalMax = Math.max(globalMax, value);

        return {
          lat: cell.lat,
          lng: cell.lng,
          value
        };
      });

      // Normalize intensity between 0 and 1
      const range = globalMax - globalMin || 1;
      gridCells = gridCells.map(cell => ({
        ...cell,
        intensity: (cell.value - globalMin) / range
      }));

      return {
        gridCells,
        meta: {
          type,
          min: globalMin !== Infinity ? globalMin : 0,
          max: globalMax !== -Infinity ? globalMax : 0,
          resolution: gridResolution
        }
      };
    } catch (error) {
      console.error('[HeatmapService] Error generating heatmap data:', error);
      throw error;
    }
  }
}

module.exports = new HeatmapService();
