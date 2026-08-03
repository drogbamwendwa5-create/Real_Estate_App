import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../Context/ThemeContext';
import PropertyCard from '../../../../Components/Property/PropertyCard';
import EmptyState from '../../../../Components/common/EmptyState';
import Icon from 'react-native-vector-icons/Ionicons';
import propertyService from '../../../../Services/api/propertyService';
import { useSelector } from 'react-redux';

export default function MyListingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setError(null);
      const response = await propertyService.getMyProperties();
      const data = response?.data || response || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error?.message || 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchListings();
  }, [fetchListings]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="lock-closed-outline"
          title="Login Required"
          description="Please log in to view your listings"
          buttonText="Login"
          onButtonPress={() => router.push('/auth/login')}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Something went wrong"
          description={error}
          buttonText="Retry"
          onButtonPress={fetchListings}
        />
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
          keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => {
            const propertyId = item.id || item._id;
            return (
            <View>
              <PropertyCard
                property={item}
                onPress={() => router.push(`/property/${propertyId}`)}
                onFavorite={() => {}}
              />
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { borderColor: theme.colors.primary }]}
                  onPress={() => router.push(`/listing/${propertyId}`)}
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
            );
          }}
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