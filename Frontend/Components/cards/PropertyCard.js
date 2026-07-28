import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 16;

const PropertyCard = ({ property, onPress, onFavouritePress }) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress(property);
    } else {
      navigation.navigate('PropertyDetail', { property });
    }
  };

  const imageUri = property.images && property.images.length > 0 && !imageError
    ? property.images[0].url
    : 'https://via.placeholder.com/300';

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <TouchableOpacity style={styles.favouriteButton} onPress={() => onFavouritePress && onFavouritePress(property)}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{property.propertyType}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice(property.price, property.currency)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {property.address?.city}, {property.address?.country}
          </Text>
        </View>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.featureText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.featureText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="square-outline" size={16} color="#666" />
            <Text style={styles.featureText}>{property.area} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default PropertyCard;