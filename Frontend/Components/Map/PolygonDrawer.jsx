import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

/**
 * Draw polygon tool
 */
export default function PolygonDrawer({ isActive, onComplete, onCancel, currentMapPress }) {
  const { theme } = useTheme();
  if (Platform.OS === 'web') return null;
  const { Polyline, Marker, Polygon, Circle, Callout } = Platform.OS === 'web' ? {} : require('react-native-maps');
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (isActive && currentMapPress) {
      setPoints(prev => [...prev, currentMapPress]);
    }
  }, [currentMapPress, isActive]);

  if (!isActive) return null;

  const handleUndo = () => {
    setPoints(prev => prev.slice(0, -1));
  };

  const handleComplete = () => {
    if (points.length >= 3) {
      onComplete(points);
      setPoints([]);
    }
  };

  const handleCancel = () => {
    setPoints([]);
    onCancel();
  };

  return (
    <>
      {points.length > 0 && (
        <Polygon
          coordinates={points}
          fillColor={theme.colors.primary + '40'} 
          strokeColor={theme.colors.primary}
          strokeWidth={2}
        />
      )}

      {points.map((p, index) => (
        <Marker key={index} coordinate={p}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        </Marker>
      ))}

      <View style={[styles.controls, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.instruction, { color: theme.colors.text }]}>
          Tap on map to draw area ({points.length} points)
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={handleUndo} disabled={points.length === 0} style={styles.iconBtn}>
            <Ionicons name="arrow-undo" size={24} color={points.length === 0 ? theme.colors.textSecondary : theme.colors.primary} />
          </TouchableOpacity>
          <Button 
            mode="contained" 
            onPress={handleComplete} 
            disabled={points.length < 3}
            buttonColor={theme.colors.primary}
            style={styles.mainBtn}
          >
            Search Area
          </Button>
          <Button 
            mode="text" 
            onPress={handleCancel}
            textColor={theme.colors.error}
          >
            Cancel
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    boxShadow: '0px 4px 4.65px rgba(0, 0, 0, 0.3)',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  mainBtn: {
    flex: 1,
    marginHorizontal: 8,
  }
});
