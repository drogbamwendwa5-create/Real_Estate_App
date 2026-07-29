import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PropertyGallery = ({ images = [] }) => {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.textSecondary }}>No images available</Text>
      </View>
    );
  }

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <View key={index} style={styles.slide}>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <>
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.disabled,
                    width: index === activeIndex ? 8 : 6,
                    height: index === activeIndex ? 8 : 6,
                  },
                ]}
              />
            ))}
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.countText}>
              {activeIndex + 1}/{images.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    position: 'relative',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
  countBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PropertyGallery;