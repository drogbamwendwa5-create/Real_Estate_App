const axios = require('axios');
const geolib = require('geolib');
const RoutingConfig = require('../Config/RoutingConfig');
const ErrorResponse = require('../Utils/ErrorResponse');

class RoutingService {
  /**
   * OSRM route calculation
   * @param {number} fromLat - Starting latitude
   * @param {number} fromLng - Starting longitude
   * @param {number} toLat - Destination latitude
   * @param {number} toLng - Destination longitude
   * @param {string} profile - Routing profile (driving, walking, cycling)
   * @returns {Promise<Object>} Route details
   */
  async getRoute(fromLat, fromLng, toLat, toLng, profile = 'driving') {
    console.log(`[RoutingService] Getting ${profile} route from ${fromLat},${fromLng} to ${toLat},${toLng}`);
    try {
      if (!fromLat || !fromLng || !toLat || !toLng) {
        throw new ErrorResponse('Start and destination coordinates are required', 400);
      }

      const validProfiles = RoutingConfig.validProfiles || ['driving', 'walking', 'cycling'];
      if (!validProfiles.includes(profile)) {
        throw new ErrorResponse(`Invalid profile. Must be one of: ${validProfiles.join(', ')}`, 400);
      }

      const osrmProfile = RoutingConfig.profileMappings?.[profile] || profile;
      const baseUrl = RoutingConfig.osrmUrl || process.env.OSRM_URL || 'https://router.project-osrm.org';
      
      const url = `${baseUrl}/route/v1/${osrmProfile}/${fromLng},${fromLat};${toLng},${toLat}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson',
          steps: true
        }
      });

      if (!response.data || response.data.code !== 'Ok' || !response.data.routes.length) {
        throw new Error('OSRM returned invalid response');
      }

      const route = response.data.routes[0];
      
      return {
        distance: parseFloat((route.distance / 1000).toFixed(2)), // in km
        duration: Math.ceil(route.duration / 60), // in minutes
        geometry: route.geometry,
        steps: route.legs[0].steps.map(step => ({
          instruction: step.maneuver.type,
          name: step.name,
          distance: step.distance,
          duration: step.duration
        }))
      };

    } catch (error) {
      console.error(`[RoutingService] Error calculating ${profile} route:`, error.message);
      
      // Fallback to straight-line distance
      console.log('[RoutingService] Falling back to straight-line distance');
      const distanceMeters = geolib.getDistance(
        { latitude: fromLat, longitude: fromLng },
        { latitude: toLat, longitude: toLng }
      );
      
      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(2));
      // Estimate 30km/h for driving fallback
      const durationMin = profile === 'driving' ? Math.ceil((distanceKm / 30) * 60) :
                          profile === 'cycling' ? Math.ceil((distanceKm / 15) * 60) :
                          Math.ceil((distanceKm / 5) * 60);

      return {
        distance: distanceKm,
        duration: durationMin,
        geometry: null,
        steps: [],
        isFallback: true
      };
    }
  }

  /**
   * Multi-waypoint routing
   * @param {Array<{lat: number, lng: number}>} waypoints - Array of coordinates
   * @param {string} profile - Routing profile
   * @returns {Promise<Object>} Route details for multiple waypoints
   */
  async getMultiRoute(waypoints, profile = 'driving') {
    console.log(`[RoutingService] Getting multi-route for ${waypoints.length} waypoints via ${profile}`);
    try {
      if (!Array.isArray(waypoints) || waypoints.length < 2) {
        throw new ErrorResponse('At least 2 waypoints are required', 400);
      }

      const validProfiles = RoutingConfig.validProfiles || ['driving', 'walking', 'cycling'];
      if (!validProfiles.includes(profile)) {
        throw new ErrorResponse(`Invalid profile. Must be one of: ${validProfiles.join(', ')}`, 400);
      }

      const osrmProfile = RoutingConfig.profileMappings?.[profile] || profile;
      const baseUrl = RoutingConfig.osrmUrl || process.env.OSRM_URL || 'https://router.project-osrm.org';
      
      const coordinates = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
      const url = `${baseUrl}/route/v1/${osrmProfile}/${coordinates}`;
      
      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson'
        }
      });

      if (!response.data || response.data.code !== 'Ok' || !response.data.routes.length) {
        throw new Error('OSRM returned invalid response');
      }

      const route = response.data.routes[0];
      
      return {
        distance: parseFloat((route.distance / 1000).toFixed(2)),
        duration: Math.ceil(route.duration / 60),
        geometry: route.geometry
      };

    } catch (error) {
      console.error('[RoutingService] Error calculating multi-route:', error.message);
      if (error instanceof ErrorResponse) throw error;
      throw new ErrorResponse('Failed to calculate multi-route', 500);
    }
  }

  /**
   * Returns commute times for all profiles at once
   * @param {number} fromLat - Starting latitude
   * @param {number} fromLng - Starting longitude
   * @param {number} toLat - Destination latitude
   * @param {number} toLng - Destination longitude
   * @returns {Promise<Object>} Commute times and distances for all profiles
   */
  async getCommuteTime(fromLat, fromLng, toLat, toLng) {
    console.log(`[RoutingService] Getting all commute times from ${fromLat},${fromLng} to ${toLat},${toLng}`);
    try {
      const [driving, walking, cycling] = await Promise.all([
        this.getRoute(fromLat, fromLng, toLat, toLng, 'driving'),
        this.getRoute(fromLat, fromLng, toLat, toLng, 'walking'),
        this.getRoute(fromLat, fromLng, toLat, toLng, 'cycling')
      ]);

      return {
        driving: { distance: driving.distance, duration: driving.duration },
        walking: { distance: walking.distance, duration: walking.duration },
        cycling: { distance: cycling.distance, duration: cycling.duration }
      };
    } catch (error) {
      console.error('[RoutingService] Error getting commute times:', error.message);
      throw new ErrorResponse('Failed to fetch commute times', 500);
    }
  }
}

module.exports = new RoutingService();
