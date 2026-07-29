import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import PropertyCard from '../../../Components/Property/PropertyCard';
import EmptyState from '../../../Components/common/EmptyState';

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();

  const collection = {
    1: { name: 'Beach Houses', properties: [1, 2] },
    2: { name: 'Downtown Condos', properties: [3] },
    3: { name: 'Family Homes', properties: [1, 3] },
  };

  const allProperties = {
    1: { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'] },
    2: { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
    3: { id: 3, title: 'Cozy Family Home', price: 580000, location: 'Pasadena, CA', bedrooms: 3, bathrooms: 3, area: 2200, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
  };

  const currentCollection = collection[id] || { name: 'Collection', properties: [] };
  const properties = currentCollection.properties.map(pid => allProperties[pid]).filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {currentCollection.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {properties.length > 0 ? (
        <FlatList
          data={properties}
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
        <EmptyState
          icon="heart-outline"
          title="Empty collection"
          description="Start adding properties to this collection"
          buttonText="Explore"
          onButtonPress={() => router.push('/')}
        />
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});