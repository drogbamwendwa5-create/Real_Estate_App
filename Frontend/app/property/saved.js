import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { formatLocation } from '../../Utils/helpers';
import { getFavourites } from '../../Services/api';

export default function SavedPropertiesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    // Only hit the protected endpoint when we actually have a session
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchFavourites = async () => {
      try {
        // Goes through the axios instance so the auth token is attached
        const data = await getFavourites();
        if (active) setFavourites(data?.data || []);
      } catch (error) {
        console.error('Error fetching favourites:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFavourites();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const renderFavourite = ({ item }) => {
    // Works with populated property docs and flat favourite records alike
    const prop = item.property || item;
    const id = item.propertyId || item.property?._id || item._id;
    return (
      <Card style={styles.card} onPress={() => router.push(`/listing/${id}`)}>
        <Card.Cover source={{ uri: item.image || prop.images?.[0]?.url || 'https://via.placeholder.com/400x200' }} />
        <Card.Content>
          <Title>{item.title || prop.title || 'Beautiful Property'}</Title>
          <Paragraph style={styles.price}>${(prop.price ?? item.price ?? 0)?.toLocaleString()}</Paragraph>
          <View style={styles.locationRow}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.location}>{formatLocation(prop.location, prop.address)}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, styles.container]}>
        <Ionicons name="lock-closed-outline" size={48} color={theme.colors.textSecondary} />
        <Title style={{ color: theme.colors.text }}>Login required</Title>
        <Paragraph style={styles.emptySubtext}>Log in to see the homes you saved.</Paragraph>
        <Button mode="contained" onPress={() => router.push('/auth/login')}>Login</Button>
      </View>
    );
  }

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
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Title style={styles.headerTitle}>Saved Properties</Title>
            <Paragraph style={styles.headerSubtitle}>Your favourite listings</Paragraph>
          </View>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
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
