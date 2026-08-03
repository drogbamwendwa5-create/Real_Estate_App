import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

/**
 * Cluster marker for grouped properties
 */
export default function PropertyCluster({ count = 0, coordinate, onPress }) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  // Scale size based on count
  let size = 30;
  if (count >= 5 && count < 20) size = 40;
  else if (count >= 20) size = 50;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.cluster,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={[styles.count, { color: theme.colors.surface }]}>
          {count}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  count: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
