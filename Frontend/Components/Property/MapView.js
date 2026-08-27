import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const DETAILED_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function PropertyMapView({ location, title, coordinates, propertyId }) {
  const { theme } = useTheme();
  const router = useRouter();

  const lat = Number(coordinates?.[1] ?? coordinates?.latitude ?? -1.2921);
  const lng = Number(coordinates?.[0] ?? coordinates?.longitude ?? 36.8219);

  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleOpenFullMap = () => {
    router.push({
      pathname: '/map',
      params: {
        id: propertyId,
        lat: String(lat),
        lng: String(lng),
        title: title || 'Property Location',
      },
    });
  };

  const primaryColor = theme?.colors?.primary || '#2563eb';
  const bgColor = theme?.colors?.background || '#f8fafc';

  if (Platform.OS === 'web') {
    const webHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: ${bgColor}; }
    .leaflet-control-attribution,
    .leaflet-control-container .leaflet-bottom,
    .leaflet-attribution-flag {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
    }
    .pointer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    }
    .pointer-badge {
      background: ${primaryColor};
      color: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      border: 1.5px solid #fff;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pointer-stem {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid ${primaryColor};
      margin-top: -1px;
    }
    .pointer-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: ${primaryColor};
      border: 1px solid #fff;
      margin-top: -2px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { center: [${lat}, ${lng}], zoom: 15, zoomControl: false, attributionControl: false });
    L.tileLayer('${DETAILED_TILE_URL}', { maxZoom: 20, subdomains: ['a', 'b', 'c', 'd'] }).addTo(map);
    var icon = L.divIcon({
      className: 'custom-icon',
      html: '<div class="pointer-container"><div class="pointer-badge">📍 <span>Exact Location</span></div><div class="pointer-stem"></div><div class="pointer-dot"></div></div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);
  </script>
</body>
</html>`;

    return (
      <View style={styles.container}>
        <View style={styles.mapHeader}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Location & Nearby</Text>
          <TouchableOpacity style={styles.expandButton} onPress={handleOpenFullMap}>
            <Text style={[styles.expandText, { color: theme.colors.primary }]}>Explore Map</Text>
            <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
          📍 {location || 'Nairobi, Kenya'}
        </Text>

        <View style={[styles.mapWrapper, { borderColor: theme.colors.border }]}>
          <iframe
            srcDoc={webHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Property Location Detailed Preview"
          />

          <TouchableOpacity 
            style={[styles.overlayButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleOpenFullMap}
            activeOpacity={0.9}
          >
            <Icon name="map-outline" size={18} color="#FFFFFF" />
            <Text style={styles.overlayButtonText}>Open Interactive Map & Investment Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  let MapView = View;
  let Marker = View;
  let UrlTile = null;
  try {
    const maps = require('react-native-maps');
    MapView = maps.default || maps;
    Marker = maps.Marker;
    UrlTile = maps.UrlTile;
  } catch {
    MapView = View;
    Marker = View;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Location & Nearby</Text>
        <TouchableOpacity style={styles.expandButton} onPress={handleOpenFullMap}>
          <Text style={[styles.expandText, { color: theme.colors.primary }]}>Explore Map</Text>
          <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
        📍 {location || 'Nairobi, Kenya'}
      </Text>

      <View style={[styles.mapWrapper, { borderColor: theme.colors.border }]}>
        <MapView
          style={styles.map}
          initialRegion={region}
          mapType="standard"
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {UrlTile && <UrlTile urlTemplate={DETAILED_TILE_URL} maximumZ={20} flipY={false} />}
          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            anchor={{ x: 0.5, y: 1.0 }}
            title={title}
            description={location}
          >
            <View style={styles.nativePointer}>
              <View style={[styles.customPin, { backgroundColor: theme.colors.primary }]}>
                <Icon name="home" size={14} color="#FFFFFF" />
              </View>
              <View style={[styles.pinStem, { borderTopColor: theme.colors.primary }]} />
              <View style={[styles.pinDot, { backgroundColor: theme.colors.primary }]} />
            </View>
          </Marker>
        </MapView>

        <TouchableOpacity 
          style={[styles.overlayButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleOpenFullMap}
          activeOpacity={0.9}
        >
          <Icon name="map-outline" size={18} color="#FFFFFF" />
          <Text style={styles.overlayButtonText}>Open Interactive Map & Investment Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 12,
  },
  mapWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  nativePointer: {
    alignItems: 'center',
  },
  customPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginTop: -2,
  },
  overlayButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
  },
  overlayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
