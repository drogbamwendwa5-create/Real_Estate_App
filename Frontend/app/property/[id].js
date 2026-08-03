import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { Surface, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import PropertyGallery from '../../Components/Property/PropertyGallery';
import QuickStats from '../../Components/Property/QuickStats';
import Amenities from '../../Components/Property/Amenities';
import AgentCard from '../../Components/Property/AgentCard';
import PropertyMapView from '../../Components/Property/MapView';
import { formatPrice, formatLocation } from '../../Utils/helpers';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import PropertyService from '../../Services/api/propertyService';

const FALLBACK_PROPERTY_DETAILS = {
  '1': {
    id: '1', title: 'Luxury Villa - Runda', price: 85000000, location: 'Runda, Nairobi', street: '123 Runda Drive', city: 'Nairobi', propertyType: 'Villa', bedrooms: 5, bathrooms: 4, area: 450,
    description: 'Stunning luxury villa in Runda with panoramic views, a private pool, and world-class amenities. This architectural masterpiece features high ceilings, marble floors, and smart-home technology.',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'], amenities: ['WiFi', 'Pool', 'Gym', 'Security', 'Parking', 'AC', 'Generator', 'Water Tank'],
  },
  '2': {
    id: '2', title: 'Modern Apartment - Westlands', price: 18000000, location: 'Westlands, Nairobi', city: 'Nairobi', propertyType: 'Apartment', bedrooms: 2, bathrooms: 2, area: 120,
    description: 'A bright, modern apartment in the heart of Westlands, close to restaurants, shopping, and Nairobi business districts. Designed for easy city living with generous natural light.',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'], amenities: ['Security', 'Parking', 'Elevator', 'Backup Power', 'Gym'],
  },
  '3': {
    id: '3', title: 'Cozy Family Home - Lavington', price: 35000000, location: 'Lavington, Nairobi', city: 'Nairobi', propertyType: 'Family Home', bedrooms: 3, bathrooms: 3, area: 220,
    description: 'A welcoming family home in leafy Lavington with comfortable living spaces, a private garden, and quick access to schools, parks, and local amenities.',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'], amenities: ['Garden', 'Security', 'Parking', 'Water Tank', 'Staff Quarters'],
  },
};

const normalizeProperty = (rawProperty, requestedId) => {
  if (!rawProperty) return null;
  const rawImages = rawProperty.images || rawProperty.propertyImages || [];
  const images = rawImages
    .map((image) => (typeof image === 'string' ? image : image?.url))
    .filter(Boolean);
  const location = typeof rawProperty.location === 'string'
    ? rawProperty.location
    : [rawProperty.estate, rawProperty.town, rawProperty.county].filter(Boolean).join(', ') || 'Location not specified';

  return {
    ...rawProperty,
    id: rawProperty._id || rawProperty.id || requestedId,
    images,
    location,
    area: rawProperty.area ?? rawProperty.size,
    agent: rawProperty.agent || (rawProperty.agentName ? {
      name: rawProperty.agentName,
      title: rawProperty.agencyName || 'Real Estate Agent',
      phone: rawProperty.agentPhone,
    } : undefined),
  };
};

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const favouriteIds = useSelector((state) => {
    const items = state.favourite?.favourites || [];
    return items.map((item) => item?._id || item?.id || item?.property?._id || item?.property?.id);
  }, shallowEqual);
  const isFavourite = favouriteIds.includes(property?._id || property?.id);

  useEffect(() => {
    let active = true;
    const fetchProperty = async () => {
      try {
        const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!propertyId) return;

        const response = await PropertyService.getAggregatedProperty(propertyId);
        const loadedProperty = response?.data || response?.property || response;
        if (active && loadedProperty) setProperty(normalizeProperty(loadedProperty, propertyId));
      } catch (error) {
        // Sample listings use numeric IDs; keep them usable when the API is offline.
        const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
        if (active) setProperty(normalizeProperty(FALLBACK_PROPERTY_DETAILS[propertyId], propertyId));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProperty();
    return () => { active = false; };
  }, [params.id]);

  const toggleFavourite = () => {
    if (property) {
      dispatch(toggleFavouriteAction(property));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Title style={styles.errorText}>Property not found</Title>
        <Button mode="contained" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" translucent />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {showGallery ? (
            <PropertyGallery images={property.images || []} />
          ) : (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {property.images?.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )}
          <View style={[styles.imageOverlay, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} hitSlop={12} activeOpacity={0.8}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favButton} onPress={toggleFavourite}>
              <Icon 
                name={isFavourite ? 'heart' : 'heart-outline'} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          {property.images?.length > 1 && (
            <View style={[styles.imageCount, { backgroundColor: theme.colors.primary, top: insets.top + 16 }]}>
              <Text style={styles.imageCountText}>
                {property.images.length} Photos
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Title style={[styles.title, { color: theme.colors.text }]}>
                {property.title}
              </Title>
              <Paragraph style={[styles.price, { color: theme.colors.primary }]}>
                {formatPrice(property.price)}
              </Paragraph>
              <Paragraph style={[styles.location, { color: theme.colors.textSecondary }]}>
                📍 {formatLocation(property.location, property.address)}
              </Paragraph>
            </View>
            {property.images?.length > 1 && (
              <TouchableOpacity 
                style={styles.viewGalleryButton}
                onPress={() => setShowGallery(!showGallery)}
              >
                <Icon name="images" size={20} color={theme.colors.primary} />
                <Text style={[styles.viewGalleryText, { color: theme.colors.primary }]}>
                  {showGallery ? 'Hide' : 'View'} Gallery
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <QuickStats
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            area={property.area}
            parking={property.parking}
          />

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About This Property
          </Title>
          <Paragraph style={[styles.description, { color: theme.colors.textSecondary }]}>
            {property.description}
          </Paragraph>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Amenities
          </Title>
          <Amenities amenities={property.amenities} />

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <PropertyMapView 
            location={property.location || `${property.street || ''}, ${property.city || ''}`}
            title={property.title}
            coordinates={property.location?.coordinates || property.coordinates || [-1.2921, 36.8219]}
            propertyId={property._id || property.id}
          />

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Agent
          </Title>
          {property.agent && (
            <AgentCard 
              agent={property.agent} 
              onPress={() => router.push(`/agents/${property.agent.id}`)}
            />
          )}

          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push(`/property/schedule-viewing?id=${property.id}`)}
              icon="calendar"
            >
              Schedule Viewing
            </Button>
            <Button 
              mode="outlined" 
              style={[styles.button, { borderColor: theme.colors.primary }]}
              onPress={() => router.push(`/property/mortgage-calculator?price=${property.price}`)}
              icon="calculator"
            >
              Mortgage Calculator
            </Button>
          </View>

          <View style={{ height: theme.spacing.lg }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCount: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
  },
  viewGalleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  viewGalleryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  button: {
    borderRadius: 12,
  },
});
