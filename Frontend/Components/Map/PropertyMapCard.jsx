import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, Animated, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { formatPrice, formatLocation } from '../../Utils/helpers';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import { createFavouriteIdsSelector } from '../../store/selectors';

const favouriteIdsSelector = createFavouriteIdsSelector();

/**
 * Bottom sheet card for selected property
 */
export default function PropertyMapCard({ property, onClose, onViewDetails, onGetDirections }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const favouriteIds = useSelector(favouriteIdsSelector);
  const isFavorite = favouriteIds.includes(property?._id || property?.id);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (property) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [property, slideAnim]);

  if (!property) return null;

  const images = property.images || property.propertyImages || [];
  const imageUrl = typeof property.image === 'string' 
    ? property.image 
    : (images[0]?.url || images[0] || 'https://via.placeholder.com/150');

  const handleFavoriteToggle = () => {
    dispatch(toggleFavouriteAction(property));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.topHeaderRow}>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoriteToggle}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? theme.colors.error : theme.colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {formatPrice(property.price, property.currency)}
          </Text>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            <Ionicons name="location" size={12} /> {formatLocation(property.location || property.locationName, property.address)}
          </Text>
          
          <View style={styles.stats}>
            {property.bedrooms != null && (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                <Ionicons name="bed" size={12} /> {property.bedrooms} Beds
              </Text>
            )}
            {property.bathrooms != null && (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                <Ionicons name="water" size={12} /> {property.bathrooms} Baths
              </Text>
            )}
            {(property.area != null || property.size != null) && (
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                <Ionicons name="square" size={12} /> {property.area || property.size} m²
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={() => onViewDetails(property)} style={styles.button} buttonColor={theme.colors.primary}>
          View Details
        </Button>
        <Button mode="outlined" onPress={() => onGetDirections(property)} style={styles.button} textColor={theme.colors.primary}>
          Directions
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 4px 4.65px rgba(0, 0, 0, 0.3)',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
});
