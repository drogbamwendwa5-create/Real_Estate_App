import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const OSM_TILE_URL = process.env.EXPO_PUBLIC_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function PropertyMapView({ location, title, coordinates, propertyId }) {
  const { theme } = useTheme();
  const router = useRouter();

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>Map preview is available on mobile.</Text>
      </View>
    );
  }

  const { default: MapView, Marker, UrlTile } = require('react-native-maps');

  const lat = coordinates?.[1] || coordinates?.latitude || -1.2921;
  const lng = coordinates?.[0] || coordinates?.longitude || 36.8219;

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
          mapType="none"
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} />
          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            title={title}
            description={location}
          >
            <View style={[styles.customPin, { backgroundColor: theme.colors.primary }]}>
              <Icon name="home" size={16} color="#FFFFFF" />
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
  customPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    elevation: 3,
  },
  overlayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
