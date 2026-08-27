import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';

const PropertyCard = ({ property, onPress, onFavouritePress, isFavorite = false, style, compact }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [imageError, setImageError] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);

  // Responsive mode calculations
  const isWide = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  const isCompact = compact !== undefined ? compact : (isWide || isTablet);

  // Dynamic card image height based on screen/container
  const imageHeight = useMemo(() => {
    if (isWide) return 150;
    if (isTablet) return 165;
    return width < 380 ? 140 : 160;
  }, [isWide, isTablet, width]);

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else {
      router.push(`/property/${property._id || property.id}`);
    }
  };

  const handleFavouritePress = () => {
    if (onFavouritePress) {
      onFavouritePress(property);
      setIsFav(!isFav);
    }
  };

  const images = property.images || property.propertyImages || [];
  const imageUri = images.length > 0 && !imageError
    ? (images[0].url || images[0])
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      notation: isCompact && price >= 1000000 ? 'compact' : 'standard',
    }).format(price);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(10,10,30,0.72)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <TouchableOpacity 
          style={styles.favouriteButton} 
          onPress={handleFavouritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={isCompact ? 18 : 20} color={isFav ? "#EF4444" : "#FFFFFF"} />
        </TouchableOpacity>
        {property.propertyType ? (
          <View style={[styles.typeBadge, { backgroundColor: 'rgba(37,99,235,0.9)' }]}>
            <Text style={[styles.typeText, isCompact && { fontSize: 9 }]}>{property.propertyType}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.content, isCompact && { padding: 10 }]}>
        <Text style={[styles.price, isCompact && { fontSize: 15 }]} numberOfLines={1}>
          {formatPrice(property.price, property.currency)}
        </Text>
        <Text style={[styles.cardTitle, isCompact && { fontSize: 12, lineHeight: 16 }]} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={isCompact ? 12 : 13} color="rgba(255,255,255,0.55)" />
          <Text style={[styles.location, isCompact && { fontSize: 10 }]} numberOfLines={1}>
            {property.address?.city || property.estate || property.neighborhood || property.county || property.town || property.location || 'Location not specified'}
          </Text>
        </View>
        <View style={styles.features}>
          {property.bedrooms != null && property.bedrooms > 0 && (
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={isCompact ? 13 : 15} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.featureText, isCompact && { fontSize: 11 }]}>
                {property.bedrooms}
              </Text>
            </View>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={isCompact ? 13 : 15} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.featureText, isCompact && { fontSize: 11 }]}>
                {property.bathrooms}
              </Text>
            </View>
          )}
          {(property.area || property.size) && (
            <View style={styles.feature}>
              <Ionicons name="square-outline" size={isCompact ? 13 : 15} color="rgba(255,255,255,0.7)" />
              <Text style={[styles.featureText, isCompact && { fontSize: 11 }]}>
                {property.area || property.size} {property.areaUnit || 'sqft'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 14,
    marginBottom: 14,
    boxShadow: '0px 3px 6px rgba(15, 23, 42, 0.1)',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      },
      default: {},
    }),
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favouriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 18,
    padding: 6,
    backdropFilter: 'blur(4px)',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  content: {
    padding: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    color: '#60A5FA',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 3,
  },
  location: {
    fontSize: 11,
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
    alignItems: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});

export default React.memo(PropertyCard);
