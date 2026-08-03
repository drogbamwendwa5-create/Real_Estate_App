import React from 'react';
import { Platform } from 'react-native';

/**
 * Heatmap circles overlay
 */
export default function HeatmapOverlay({ data = [] }) {
  if (Platform.OS === 'web') return null;
  const { Circle } = require('react-native-maps');
  if (!data || data.length === 0) return null;

  const getColor = (intensity) => {
    if (intensity < 0.33) {
      return `rgba(76, 175, 80, ${intensity * 1.5})`; // Green
    } else if (intensity < 0.66) {
      return `rgba(255, 235, 59, ${intensity * 1.2})`; // Yellow
    } else {
      return `rgba(244, 67, 54, ${intensity})`; // Red
    }
  };

  const baseRadius = 500; // in meters

  return (
    <>
      {data.map((point, index) => {
        const radius = point.value ? baseRadius * (1 + point.value / 100) : baseRadius;
        
        return (
          <Circle
            key={index}
            center={{ latitude: point.lat, longitude: point.lng }}
            radius={radius}
            fillColor={getColor(point.intensity || 0.5)}
            strokeColor="transparent"
            strokeWidth={0}
          />
        );
      })}
    </>
  );
}
