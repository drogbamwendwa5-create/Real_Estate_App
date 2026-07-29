import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../Context/ThemeContext';
import PropertyCard from '../../../../Components/Property/PropertyCard';
import EmptyState from '../../../../Components/common/EmptyState';
import Icon from 'react-native-vector-icons/Ionicons';

const MOCK_LISTINGS = [
  { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'], status: 'active' },
  { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'], status: 'active' },
];

export default function MyListingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Simulate API fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        setListings(MOCK_LISTINGS);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Listings
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {listings.length} {listings.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {listings.length > 0 ? (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View>
              <PropertyCard
                property={item}
                onPress={() => router.push(`/property/${item.id}`)}
                onFavorite={() => {}}
              />
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                  onPress={() => router.push(`/listing/${item.id}`)}
                >
                  <Icon name="pencil" size={16} color={theme.colors.primary} />
                  <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.error }]}
                  onPress={() => {}}
                >
                  <Icon name="trash" size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      ) : (
        <EmptyState
          icon="home-outline"
          title="No listings yet"
          description="Start by creating your first property listing"
          buttonText="Create Listing"
          onButtonPress={() => router.push('/listing/create')}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={() => router.push('/listing/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
  },
});