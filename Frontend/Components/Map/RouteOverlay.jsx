import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

/**
 * Route polyline on map
 */
export default function RouteOverlay({ route, profile = 'driving', distance, duration }) {
  const { theme } = useTheme();
  if (Platform.OS === 'web') return null;
  const { Polyline, Marker, Polygon, Circle, Callout } = Platform.OS === 'web' ? {} : require('react-native-maps');

  if (!route || !route.coordinates || route.coordinates.length === 0) return null;

  let strokeColor = theme.colors.primary; 
  if (profile === 'walking') strokeColor = '#4CAF50'; 
  if (profile === 'cycling') strokeColor = '#FF9800'; 

  const midIndex = Math.floor(route.coordinates.length / 2);
  const midPoint = route.coordinates[midIndex];

  return (
    <>
      <Polyline
        coordinates={route.coordinates}
        strokeWidth={4}
        strokeColor={strokeColor}
        lineDashPattern={profile === 'walking' ? [5, 5] : null}
      />
      {midPoint && distance && duration && (
        <Marker coordinate={midPoint} tracksViewChanges={false}>
          <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: strokeColor }]}>
            <Text style={[styles.badgeText, { color: theme.colors.text }]}>
              {distance} • {duration}
            </Text>
          </View>
        </Marker>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
