import React from 'react';
import { Platform, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

const getIconForType = (type) => {
  switch (type?.toLowerCase()) {
    case 'school': return { name: 'book', color: '#4CAF50' };
    case 'hospital': return { name: 'medical', color: '#F44336' };
    case 'bank': return { name: 'cash', color: '#2196F3' };
    case 'restaurant': return { name: 'restaurant', color: '#FF9800' };
    case 'supermarket': return { name: 'cart', color: '#9C27B0' };
    default: return { name: 'location', color: '#757575' };
  }
};

/**
 * Marker for nearby amenities
 */
export default function AmenityMarker({ amenity }) {
  const { theme } = useTheme();
  if (Platform.OS === 'web') return null;
  const { Polyline, Marker, Polygon, Circle, Callout } = Platform.OS === 'web' ? {} : require('react-native-maps');
  
  if (!amenity || !amenity.lat || !amenity.lng) return null;

  const iconInfo = getIconForType(amenity.type);

  return (
    <Marker
      coordinate={{ latitude: amenity.lat, longitude: amenity.lng }}
      tracksViewChanges={false}
    >
      <View style={[styles.markerContainer, { backgroundColor: iconInfo.color }]}>
        <Ionicons name={iconInfo.name} size={14} color="#fff" />
      </View>
      <Callout tooltip>
        <View style={[styles.calloutContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {amenity.name || 'Unknown'}
          </Text>
          {amenity.distance && (
            <Text style={[styles.distance, { color: theme.colors.textSecondary }]}>
              {amenity.distance}m away
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)',
  },
  calloutContainer: {
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  distance: {
    fontSize: 10,
  },
});
