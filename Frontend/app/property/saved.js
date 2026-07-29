import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';

export default function SavedPropertiesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/favourites');
        const data = await response.json();
        setFavourites(data.data || []);
      } catch (error) {
        console.error('Error fetching favourites:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  const renderFavourite = ({ item }) => (
    <Card style={styles.card} onPress={() => router.push(`/property/${item.propertyId}`)}>
      <Card.Cover source={{ uri: item.image || 'https://via.placeholder.com/400x200' }} />
      <Card.Content>
        <Title>{item.title || 'Beautiful Property'}</Title>
        <Paragraph style={styles.price}>${item.price?.toLocaleString()}</Paragraph>
        <View style={styles.locationRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.location}>{item.location || 'Unknown location'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Saved Properties</Title>
        <Paragraph style={styles.headerSubtitle}>Your favourite listings</Paragraph>
      </Surface>
      <FlatList
        data={favourites}
        renderItem={renderFavourite}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Surface style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.empty}>No saved properties yet</Text>
            <Text style={styles.emptySubtext}>Start exploring and save your favourites</Text>
            <Button mode="contained" onPress={() => router.push('/search')}>Browse Properties</Button>
          </Surface>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  location: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  empty: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
});
