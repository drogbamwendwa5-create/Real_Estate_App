import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import PropertyCard from '../../../Components/Property/PropertyCard';
import EmptyState from '../../../Components/common/EmptyState';
import SectionHeader from '../../../Components/Home/SectionHeader';

const SAVED_PROPERTIES = [
  { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'] },
  { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
];

export default function SavedScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved</Text>
        <TouchableOpacity onPress={() => router.push('/saved/collections')}>
          <Text style={[styles.collectionsLink, { color: theme.colors.primary }]}>View Collections</Text>
        </TouchableOpacity>
      </View>

      {SAVED_PROPERTIES.length > 0 ? (
        <FlatList
          data={SAVED_PROPERTIES}
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
          title="No saved properties"
          description="Properties you save will appear here"
          buttonText="Start Exploring"
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  collectionsLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
