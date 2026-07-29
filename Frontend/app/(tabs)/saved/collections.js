import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import EmptyState from '../../../Components/common/EmptyState';

const COLLECTIONS = [
  { id: 1, name: 'Beach Houses', count: 12, cover: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6' },
  { id: 2, name: 'Downtown Condos', count: 8, cover: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' },
  { id: 3, name: 'Family Homes', count: 15, cover: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994' },
];

export default function CollectionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Collections</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Organize your saved properties
        </Text>
      </View>

      {COLLECTIONS.length > 0 ? (
        <FlatList
          data={COLLECTIONS}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.collectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.push(`/saved/${item.id}`)}
            >
              <View style={styles.collectionInfo}>
                <Text style={[styles.collectionName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.collectionCount, { color: theme.colors.textSecondary }]}>
                  {item.count} properties
                </Text>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 24 }} />}
        />
      ) : (
        <EmptyState
          icon="folder-outline"
          title="No collections"
          description="Create collections to organize your saved properties"
          buttonText="Create Collection"
          onButtonPress={() => {}}
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
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
