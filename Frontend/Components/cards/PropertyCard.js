import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 16;

const PropertyCard = ({ property, onPress, onFavouritePress, isFavorite = false }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);

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
    : 'https://via.placeholder.com/300';

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(10,10,30,0.62)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <TouchableOpacity style={styles.favouriteButton} onPress={handleFavouritePress}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.typeBadge, { backgroundColor: 'rgba(37,99,235,0.85)' }]}>
          <Text style={styles.typeText}>{property.propertyType}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(property.price, property.currency)}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.55)" />
          <Text style={styles.location} numberOfLines={1}>
            {property.address?.city || property.estate || property.neighborhood || property.county || property.town || 'Location not specified'}
          </Text>
        </View>
        <View style={styles.features}>
          {property.bedrooms && (
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {property.bedrooms}
              </Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {property.bathrooms}
              </Text>
            </View>
          )}
          {(property.area || property.size) && (
            <View style={styles.feature}>
              <Ionicons name="square-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
                {property.area || property.size} sqft
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
    width: cardWidth,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favouriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: 12,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    color: '#60A5FA',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
    color: '#FFFFFF',
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
  },
  location: {
    fontSize: 11,
    marginLeft: 4,
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default React.memo(PropertyCard);
