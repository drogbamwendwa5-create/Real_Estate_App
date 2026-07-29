import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import PropertyCard from '../../Components/Property/PropertyCard';
import SectionHeader from '../../Components/Home/SectionHeader';
import MapToggle from '../../Components/Search/MapToggle';

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const mockProperties = [
    { id: 1, title: 'Luxury Apartment', price: 250000, location: 'New York, NY', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
    { id: 2, title: 'Modern Villa', price: 500000, location: 'Beverly Hills, CA', bedrooms: 4, bathrooms: 3, area: 2800, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'] },
    { id: 3, title: 'Cozy Cottage', price: 180000, location: 'Austin, TX', bedrooms: 2, bathrooms: 1, area: 900, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Search</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Find your perfect property
        </Text>
      </View>

      <View style={styles.toolbar}>
        <MapToggle viewMode={viewMode} onToggle={setViewMode} />
      </View>

      <SectionHeader 
        title={`${mockProperties.length} Results`} 
      />

      {viewMode === 'list' ? (
        <FlatList
          data={mockProperties}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item.id}`)}
              onFavorite={() => {}}
            />
          )}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={{ color: theme.colors.textSecondary }}>Map view - integrate map library here</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
