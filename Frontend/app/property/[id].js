import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { Surface, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import PropertyGallery from '../../Components/Property/PropertyGallery';
import QuickStats from '../../Components/Property/QuickStats';
import Amenities from '../../Components/Property/Amenities';
import AgentCard from '../../Components/Property/AgentCard';

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Simulate API fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        setProperty({
          id: params.id,
          title: 'Luxury Villa with Pool',
          price: 1250000,
          location: 'Beverly Hills, CA',
          street: '123 Luxury Lane',
          city: 'Beverly Hills',
          propertyType: 'Villa',
          bedrooms: 5,
          bathrooms: 4,
          area: 4500,
          description: 'Stunning luxury villa with panoramic views, private pool, and world-class amenities. This architectural masterpiece features high ceilings, marble floors, and state-of-the-art smart home technology.',
          images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
            'https://images.unsplash.com/photo-1600596542815-27bfef402323',
          ],
          amenities: ['WiFi', 'Pool', 'Gym', 'Security', 'Parking', 'AC'],
          agent: {
            name: 'Sarah Johnson',
            title: 'Senior Real Estate Agent',
            rating: 4.9,
            reviewCount: 127,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop',
            phone: '+1 234 567 890',
          },
        });
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProperty();
  }, [params.id]);

  const toggleFavourite = () => {
    setIsFavourite(!isFavourite);
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
        <Button mode="contained" onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
            <View style={[styles.imageCount, { backgroundColor: theme.colors.primary }]}>
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
                ${property.price?.toLocaleString()}
              </Paragraph>
              <Paragraph style={[styles.location, { color: theme.colors.textSecondary }]}>
                📍 {property.location}
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
