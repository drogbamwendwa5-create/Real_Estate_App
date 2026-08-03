import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { formatLocation } from '../../Utils/helpers';
import { getMyProperties } from '../../Services/api';

export default function MyListingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getMyProperties();
        setProperties(data.data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const renderProperty = ({ item }) => (
    <Card style={styles.card} onPress={() => router.push(`/property/${item._id}`)}>
      <Card.Cover source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }} />
      <Card.Content>
        <Title>{item.title}</Title>
        <Paragraph style={styles.price}>${item.price?.toLocaleString()}</Paragraph>
        <View style={styles.locationRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.location}>{formatLocation(item.location, item.address)}</Text>
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
        <Title style={styles.headerTitle}>My Listings</Title>
        <Paragraph style={styles.headerSubtitle}>Manage your properties</Paragraph>
      </Surface>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Surface style={styles.emptyContainer}>
            <Text style={styles.empty}>No properties listed yet</Text>
            <Button mode="contained" onPress={() => router.push('/property/create')}>Create Listing</Button>
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
    marginTop: theme.spacing.lg,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
});
