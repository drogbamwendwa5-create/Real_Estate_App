import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

export const PropertyCardSkeleton = ({ compact, style }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  const isWide = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  const isCompact = compact !== undefined ? compact : (isWide || isTablet);

  const imageHeight = useMemo(() => {
    if (isWide) return 160;
    if (isTablet) return 175;
    return width < 380 ? 150 : 190;
  }, [isWide, isTablet, width]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const skeletonColor = theme.colors.border || 'rgba(150, 150, 150, 0.2)';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          marginBottom: theme.spacing?.md || 16,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.imageSkeleton,
          {
            height: imageHeight,
            backgroundColor: skeletonColor,
            opacity: pulseAnim,
          },
        ]}
      />

      <View style={[styles.content, { padding: isCompact ? 12 : (theme.spacing?.md || 16) }]}>
        <Animated.View
          style={[
            styles.placeholderBar,
            {
              width: '45%',
              height: isCompact ? 18 : 22,
              backgroundColor: skeletonColor,
              opacity: pulseAnim,
              marginBottom: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.placeholderBar,
            {
              width: '75%',
              height: isCompact ? 14 : 16,
              backgroundColor: skeletonColor,
              opacity: pulseAnim,
              marginBottom: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.placeholderBar,
            {
              width: '55%',
              height: isCompact ? 12 : 14,
              backgroundColor: skeletonColor,
              opacity: pulseAnim,
              marginBottom: 12,
            },
          ]}
        />
        <View style={styles.statsRow}>
          <Animated.View
            style={[
              styles.placeholderPill,
              {
                width: 50,
                height: 18,
                backgroundColor: skeletonColor,
                opacity: pulseAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.placeholderPill,
              {
                width: 50,
                height: 18,
                backgroundColor: skeletonColor,
                opacity: pulseAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.placeholderPill,
              {
                width: 60,
                height: 18,
                backgroundColor: skeletonColor,
                opacity: pulseAnim,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
  },
  content: {},
  placeholderBar: {
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderPill: {
    borderRadius: 9,
  },
});

export default PropertyCardSkeleton;
