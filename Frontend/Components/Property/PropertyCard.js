import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { formatPrice } from '../../Utils/helpers';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import { createFavouriteIdsSelector } from '../../store/selectors';

const favouriteIdsSelector = createFavouriteIdsSelector();

const PropertyCard = ({ property, onPress, onFavorite, style, compact, index }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const favouriteIds = useSelector(favouriteIdsSelector);
  const isFavorite = favouriteIds.includes(property?._id || property?.id);

  const isWide = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  const isCompact = compact !== undefined ? compact : (isWide || isTablet);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    const delay = index !== undefined ? Math.min((index % 6) * 35, 200) : 0;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const imageHeight = useMemo(() => {
    if (isWide) return 160;
    if (isTablet) return 175;
    return width < 380 ? 150 : 190;
  }, [isWide, isTablet, width]);

  if (!property) return null;

  // Handle both string URLs and object format from backend
  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.src || null;
  };

  const images = property.images || property.propertyImages || [];
  const firstImage = getImageUrl(property.image) || getImageUrl(images[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
  const imageCount = images.length || 1;

  // Handle location from various formats
  const getLocation = () => {
    if (property.location && typeof property.location === 'string') return property.location;
    if (property.address) {
      const parts = [property.address.street, property.address.city, property.address.state].filter(Boolean);
      return parts.join(', ') || 'Location not specified';
    }
    if (property.estate) return property.estate;
    if (property.neighborhood) return property.neighborhood;
    if (property.county) return property.county;
    if (property.town) return property.town;
    return 'Location not specified';
  };

  const handleFavoritePress = () => {
    if (onFavorite) {
      onFavorite(property);
      return;
    }
    dispatch(toggleFavouriteAction(property));
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.colors.card, 
            marginBottom: theme.spacing?.md || 16, 
            borderColor: theme.colors.border 
          }, 
          style
        ]} 
        onPress={onPress}
        activeOpacity={0.92}
      >
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image 
            source={{ uri: firstImage }} 
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            recyclingKey={firstImage}
            priority={index !== undefined && index < 4 ? 'high' : 'normal'}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, isCompact && { fontSize: 10 }]}>
              {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'}
            </Text>
          </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={isCompact ? 18 : 22} 
            color={isFavorite ? theme.colors.error : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.content, { padding: isCompact ? 12 : (theme.spacing?.md || 16) }]}>
        <Text style={[styles.price, { color: theme.colors.text }, isCompact && { fontSize: 16 }]} numberOfLines={1}>
          {formatPrice(property.price, property.currency) || 'Contact for price'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }, isCompact && { fontSize: 13, lineHeight: 18 }]} numberOfLines={1}>
          {property.title || 'Property'}
        </Text>
        <Text style={[styles.location, { color: theme.colors.textSecondary }, isCompact && { fontSize: 12, marginBottom: 8 }]} numberOfLines={1}>
          {getLocation()}
        </Text>
        
        <View style={[styles.statsRow, { gap: isCompact ? 10 : (theme.spacing?.md || 16) }]}>
          {property.bedrooms != null && property.bedrooms > 0 && (
            <View style={styles.stat}>
              <Icon name="bed" size={isCompact ? 14 : 16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }, isCompact && { fontSize: 11 }]}>
                {property.bedrooms} {isCompact ? 'bd' : 'beds'}
              </Text>
            </View>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <View style={styles.stat}>
              <Icon name="water" size={isCompact ? 14 : 16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }, isCompact && { fontSize: 11 }]}>
                {property.bathrooms} {isCompact ? 'ba' : 'baths'}
              </Text>
            </View>
          )}
          {(property.area != null || property.size != null) && (
            <View style={styles.stat}>
              <Icon name="resize" size={isCompact ? 14 : 16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }, isCompact && { fontSize: 11 }]}>
                {property.area || property.size} m²
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    boxShadow: '0px 5px 12px rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      },
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
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default React.memo(PropertyCard);
