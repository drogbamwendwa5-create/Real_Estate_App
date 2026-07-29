import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { HeroSearch } from '../../Components/Search/HeroSearch';
import PropertyCard from '../../Components/Property/PropertyCard';
import SectionHeader from '../../Components/Home/SectionHeader';
import ListPropertyFAB from '../../Components/Profile/ListPropertyFAB';

const FEATURED_PROPERTIES = [
  { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'] },
  { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
  { id: 3, title: 'Cozy Family Home', price: 580000, location: 'Pasadena, CA', bedrooms: 3, bathrooms: 3, area: 2200, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Discover
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Find your dream home with us
          </Text>
        </View>

        <HeroSearch />

        <View style={styles.section}>
          <SectionHeader 
            title="Featured Properties" 
            onViewAll={() => {}} 
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {FEATURED_PROPERTIES.map((property) => (
              <View key={property.id} style={{ width: 280, marginRight: 12 }}>
                <PropertyCard
                  property={property}
                  onPress={() => router.push(`/property/${property.id}`)}
                  onFavorite={() => {}}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader 
            title="Recent Listings" 
            onViewAll={() => {}} 
          />
          {FEATURED_PROPERTIES.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => router.push(`/property/${property.id}`)}
              onFavorite={() => {}}
            />
          ))}
        </View>
      </ScrollView>

      <ListPropertyFAB onPress={() => router.push('/listing/create')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginTop: 20,
  },
  featuredScroll: {
    paddingHorizontal: 16,
  },
});
