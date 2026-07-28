import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PropertyCard from '../Components/cards/PropertyCard';
import { getFavourites, removeFromFavourites } from '../Services/api';
import { useAuth } from '../Hooks/useAuth';

const FavouritesScreen = ({ navigation }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      const response = await getFavourites();
      setFavourites(response.data);
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
      <Text style={styles.emptyText}>No favourites yet</Text>
      <Text style={styles.emptySubtext}>Start exploring and save your favourite properties</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.property}
              onFavouritePress={() => handleRemoveFavourite(item.property._id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
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
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FavouritesScreen;