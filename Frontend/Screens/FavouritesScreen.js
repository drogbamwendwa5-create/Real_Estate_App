import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, Alert, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PropertyCard from '../Components/cards/PropertyCard';
import { getAggregatedSaved, removeFromFavourites } from '../Services/api';
import { useAuth } from '../Hooks/useAuth';
import { useTheme } from '../Context/ThemeContext';

const FavouritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
  const numColumns = useMemo(() => {
    if (width >= 1280) return 4;
    if (width >= 900) return 3;
    return 2;
  }, [width]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchFavourites();
  }, [user]);

  const fetchFavourites = async () => {
    try {
      const response = await getAggregatedSaved();
      const list = response.data || response || [];
      setFavourites(list.map((p) => ({ property: p })));
    } catch (error) {
      console.error('Error fetching favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (propertyId) => {
    try {
      await removeFromFavourites(propertyId);
      setFavourites(favourites.filter(fav => fav.property._id !== propertyId));
      Alert.alert('Success', 'Removed from favourites');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from favourites');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>No favourites yet</Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Start exploring and save your favourite properties</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved Properties</Text>
        <View style={styles.headerSpacer} />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.text }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={item => item._id || item.property?._id || Math.random().toString()}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginHorizontal: 4 }}>
              <PropertyCard
                property={item.property}
                onFavouritePress={() => handleRemoveFavourite(item.property._id)}
                isFavorite={true}
                compact={numColumns >= 3}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FavouritesScreen;