import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../Context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropertyCard from '../../../Components/Property/PropertyCard';
import EmptyState from '../../../Components/common/EmptyState';
import { toggleFavourite as toggleFavouriteAction } from '../../../store/slices/favouriteSlice';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SavedScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const savedProperties = useSelector((state) => state.favourite?.favourites || []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="chevron-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Saved</Text>
        <View style={styles.headerSpacer} />
      </View>

      {savedProperties.length > 0 ? (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => (item?._id || item?.id || Math.random().toString()).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item?._id || item?.id}`)}
              onFavorite={() => dispatch(toggleFavouriteAction(item))}
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
    </SafeAreaView>
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  collectionsLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
