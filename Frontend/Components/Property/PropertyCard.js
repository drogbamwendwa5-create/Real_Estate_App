import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';

const PropertyCard = ({ property, onPress, onFavorite, style }) => {
  const { theme } = useTheme();
  const isFavorite = useSelector((state) => 
    state.favorites?.items?.some((item) => item.id === property.id)
  );

  if (!property) return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.card, marginBottom: theme.spacing?.md || 16 }, style]} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: property.image || property.images?.[0] || 'https://via.placeholder.com/300x200' }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.badgeText}>
            {property.images?.length || 1} {property.images?.length === 1 ? 'Photo' : 'Photos'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={22} 
            color={isFavorite ? theme.colors.error : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.content, { padding: theme.spacing?.md || 16 }]}>
        <Text style={[styles.price, { color: theme.colors.text }]} numberOfLines={1}>
          ${property.price?.toLocaleString() || 'Contact for price'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {property.title || property.address || 'Property'}
        </Text>
        <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {property.location || property.neighborhood || 'Location not specified'}
        </Text>
        
        <View style={[styles.statsRow, { gap: theme.spacing?.md || 16 }]}>
          {property.bedrooms && (
            <View style={styles.stat}>
              <Icon name="bed" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.bedrooms}
              </Text>
            </View>
          )}
          {property.bathrooms && (
            <View style={styles.stat}>
              <Icon name="water" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.bathrooms}
              </Text>
            </View>
          )}
          {property.area && (
            <View style={styles.stat}>
              <Icon name="resize" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                {property.area}m²
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.location, { color: theme.colors.textSecondary, marginBottom: theme.spacing?.sm || 8 }]} numberOfLines={1}>
          {property.location || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PropertyCard;