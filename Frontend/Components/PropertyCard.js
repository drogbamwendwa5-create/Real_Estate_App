import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import theme from '../theme';

const PropertyCard = ({ property, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (property._id || property.id) {
      router.push(`/property/${property._id || property.id}`);
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Cover 
        source={{ 
          uri: property.images?.[0] || property.image || 'https://via.placeholder.com/400x200' 
        }} 
      />
      <Card.Content>
        <Title style={styles.title}>{property.title || 'Beautiful Property'}</Title>
        <Paragraph style={styles.price}>
          ${property.price?.toLocaleString() || '100,000'}
        </Paragraph>
        <View style={styles.locationRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.location}>
            {property.location || 'Unknown location'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
});

export default PropertyCard;
