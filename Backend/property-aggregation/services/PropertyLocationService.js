const geolib = require("geolib");

class PropertyLocationService {
  findNearby(properties, lat, lng, radius) {
    return properties
      .filter(p => {
        if (!p.latitude || !p.longitude) return false;
        const distance = geolib.getDistance(
          { latitude: lat, longitude: lng },
          { latitude: p.latitude, longitude: p.longitude }
        );
        return distance <= radius;
      })
      .map(p => ({
        ...p,
        distance: geolib.getDistance(
          { latitude: lat, longitude: lng },
          { latitude: p.latitude, longitude: p.longitude }
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  clusterProperties(properties, gridSize) {
    const clusters = {};
    for (const p of properties) {
      if (!p.latitude || !p.longitude) continue;
      const lat = Math.floor(p.latitude / gridSize) * gridSize;
      const lng = Math.floor(p.longitude / gridSize) * gridSize;
      const key = lat + "," + lng;
      if (!clusters[key]) clusters[key] = { center: { lat, lng }, properties: [] };
      clusters[key].properties.push(p);
    }
    return Object.values(clusters);
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    return geolib.getDistance(
      { latitude: lat1, longitude: lng1 },
      { latitude: lat2, longitude: lng2 }
    );
  }
}

module.exports = PropertyLocationService;
