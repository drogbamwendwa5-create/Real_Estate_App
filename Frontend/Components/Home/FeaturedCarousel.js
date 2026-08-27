import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { useWindowDimensions } from 'react-native';

const CARD_MARGIN = 12;

const FeaturedCarousel = ({ properties = [], loading = false }) => {
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Responsive card dimensions
  const cardWidth = React.useMemo(() => {
    if (width >= 1400) return 320;
    if (width >= 1024) return 300;
    if (width >= 640) return 290;
    return Math.min(width * 0.76, 320);
  }, [width]);

  const cardHeight = React.useMemo(() => {
    return width >= 1024 ? 200 : 220;
  }, [width]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (properties.length > 1) {
      autoScrollTimer.current = setInterval(() => {
        setActiveIndex((prev) => {
          const next = (prev + 1) % properties.length;
          flatListRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, 4000);
    }
    return () => clearInterval(autoScrollTimer.current);
  }, [properties.length]);

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'Contact Agent';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(price);
  };

  const getImageUri = (property) => {
    const imgs = property.images || property.propertyImages || [];
    if (imgs.length > 0) return imgs[0].url || imgs[0];
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
  };

  if (loading) {
    return (
      <Animated.View style={[styles.skeletonRow, { opacity: fadeAnim }]}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.skeletonCard,
              { 
                width: cardWidth, 
                height: cardHeight,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#E2E8F0' 
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  }

  if (!properties.length) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Featured Listings
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/search')}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="arrow-forward" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={properties}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        snapToInterval={cardWidth + CARD_MARGIN}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (cardWidth + CARD_MARGIN)
          );
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => {
          const imageUri = getImageUri(item);
          return (
            <TouchableOpacity
              style={[styles.card, { width: cardWidth, height: cardHeight }]}
              onPress={() => router.push(`/property/${item._id || item.id}`)}
              activeOpacity={0.92}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.cardGradient}
              >
                {/* Type badge */}
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {item.propertyType || 'Property'}
                  </Text>
                </View>

                {/* Featured star */}
                {item.isFeatured && (
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )}

                {/* Card info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardPrice}>
                    {formatPrice(item.price, item.currency)}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="rgba(255,255,255,0.7)"
                    />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.address?.city ||
                        item.estate ||
                        item.neighborhood ||
                        item.county ||
                        'Location N/A'}
                    </Text>
                  </View>
                  <View style={styles.featureRow}>
                    {item.bedrooms != null && (
                      <View style={styles.featureChip}>
                        <Ionicons name="bed-outline" size={12} color="#fff" />
                        <Text style={styles.featureChipText}>
                          {item.bedrooms}
                        </Text>
                      </View>
                    )}
                    {item.bathrooms != null && (
                      <View style={styles.featureChip}>
                        <Ionicons name="water-outline" size={12} color="#fff" />
                        <Text style={styles.featureChipText}>
                          {item.bathrooms}
                        </Text>
                      </View>
                    )}
                    {(item.area || item.size) != null && (
                      <View style={styles.featureChip}>
                        <Ionicons
                          name="square-outline"
                          size={12}
                          color="#fff"
                        />
                        <Text style={styles.featureChipText}>
                          {item.area || item.size} sqft
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {properties.slice(0, 8).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? styles.dotActive
                : {
                    backgroundColor: isDarkMode
                      ? 'rgba(255,255,255,0.25)'
                      : 'rgba(0,0,0,0.18)',
                  },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: CARD_MARGIN,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(37,99,235,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  featuredText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    gap: 3,
  },
  cardPrice: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#2563EB',
    width: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  skeletonCard: {
    borderRadius: 18,
  },
});

export default FeaturedCarousel;
