import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { formatPrice } from '../../Utils/helpers';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import { createFavouriteIdsSelector } from '../../store/selectors';

const favouriteIdsSelector = createFavouriteIdsSelector();

const PropertyCard = ({ property, onPress, onFavorite, style }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const favouriteIds = useSelector(favouriteIdsSelector);
  const isFavorite = favouriteIds.includes(property?._id || property?.id);

  if (!property) return null;

  // Handle both string URLs and object format from backend
  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.src || null;
  };

  const images = property.images || property.propertyImages || [];
  const firstImage = getImageUrl(property.image) || getImageUrl(images[0]) || 'https://via.placeholder.com/300x200';
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
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card, marginBottom: theme.spacing?.md || 16, borderColor: theme.colors.border }, style]} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: firstImage }} 
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={120}
          recyclingKey={firstImage}
        />
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>
            {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={22} 
            color={isFavorite ? theme.colors.error : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.content, { padding: theme.spacing?.md || 16 }]}>
        <Text style={[styles.price, { color: theme.colors.text }]} numberOfLines={1}>
          {formatPrice(property.price, property.currency) || 'Contact for price'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {property.title || 'Property'}
        </Text>
        <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {getLocation()}
        </Text>
        
        <View style={[styles.statsRow, { gap: theme.spacing?.md || 16 }]}>
          {property.bedrooms != null && property.bedrooms > 0 && (
            <View style={styles.stat}>
              <Icon name="bed" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.bedrooms}
              </Text>
            </View>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <View style={styles.stat}>
              <Icon name="water" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.bathrooms}
              </Text>
            </View>
          )}
          {(property.area != null || property.size != null) && (
            <View style={styles.stat}>
              <Icon name="resize" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.area || property.size} m2
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
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 2 },
      default: {},
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PropertyCard;
