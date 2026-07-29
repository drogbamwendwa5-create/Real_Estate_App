import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getProperty, toggleFavourite } from '../Services/api';
import { useAuth } from '../Hooks/useAuth';

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ route, navigation }) => {
  const { property } = route.params || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (property?.images) {
      navigation.setOptions({ title: 'Property Details' });
    }
  }, [property]);

  const images = property?.images?.length > 0 ? property.images.map(img => img.url) : ['https://via.placeholder.com/400'];

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFavourite = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add favourites');
      return;
    }

    try {
      await toggleFavourite(property._id);
      setIsFavourite(!isFavourite);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favourite');
    }
  };

  const handleContactAgent = () => {
    Alert.alert('Contact Agent', 'Contact agent feature coming soon!');
  };

  const renderFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.sectionTitle}>Features</Text>
      <View style={styles.featuresGrid}>
        <View style={styles.featureItem}>
          <Ionicons name="bed-outline" size={24} color="#007AFF" />
          <Text style={styles.featureLabel}>Bedrooms</Text>
          <Text style={styles.featureValue}>{property?.bedrooms || 0}</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="water-outline" size={24} color="#007AFF" />
          <Text style={styles.featureLabel}>Bathrooms</Text>
          <Text style={styles.featureValue}>{property?.bathrooms || 0}</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="square-outline" size={24} color="#007AFF" />
          <Text style={styles.featureLabel}>Area</Text>
          <Text style={styles.featureValue}>{property?.area || 0} sqft</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          <Text style={styles.featureLabel}>Year Built</Text>
          <Text style={styles.featureValue}>{property?.yearBuilt || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{property?.description}</Text>
    </View>
  );

  const renderAmenities = () => {
    if (!property?.amenities?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesContainer}>
          {property.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAgentInfo = () => (
    <View style={styles.agentContainer}>
      <Text style={styles.sectionTitle}>Listed By</Text>
      <View style={styles.agentInfo}>
        <View style={styles.agentAvatar}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
        <View style={styles.agentDetails}>
          <Text style={styles.agentName}>Real Estate Agent</Text>
          <Text style={styles.agentTitle}>Licensed Agent</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.contactButton} onPress={handleContactAgent}>
        <Text style={styles.contactButtonText}>Contact Agent</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.image} resizeMode="cover" />
            ))}
          </ScrollView>
          <View style={styles.imageDots}>
            {images.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentImageIndex && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.favouriteButton} onPress={handleFavourite}>
            <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={24} color={isFavourite ? '#FF3B30' : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.price}>{formatPrice(property?.price, property?.currency)}</Text>
          <Text style={styles.title}>{property?.title}</Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.location}>
              {property?.address?.street && `${property.address.street}, `}
              {property?.address?.city}, {property?.address?.country}
            </Text>
          </View>

          {renderFeatures()}
          {renderDescription()}
          {renderAmenities()}
          {renderAgentInfo()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width,
    height: 300,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  favouriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 28,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#666',
  },
  agentContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  agentTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PropertyDetailScreen;
