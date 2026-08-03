import React, { forwardRef } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

const DEFAULT_REGION = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const OSM_TILE_URL = process.env.EXPO_PUBLIC_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Core Map component using OpenStreetMap tiles
 */
const OSMMapView = forwardRef(function OSMMapView({
  initialRegion = DEFAULT_REGION,
  onRegionChange,
  onPress,
  children,
  style,
  showsUserLocation,
  mapRef
}, forwardedRef) {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    // Simple placeholder for web; could be replaced with a web map library.
    return (
      <View style={[styles.container, style]}>
        <View style={styles.map}>
          {/* Web map placeholder */}
          <Text style={{textAlign:'center', marginTop:10}}>Map view is not supported on web.</Text>
        </View>
        {children}
      </View>
    );
  }

  const { default: MapView, UrlTile } = require('react-native-maps');

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={forwardedRef || mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChange}
        onPress={onPress}
        showsUserLocation={showsUserLocation}
        mapType="none"
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
        />
        {children}
      </MapView>
    </View>
  );
});

export default OSMMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
