import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import PropertyCard from '../../Components/Property/PropertyCard';
import SectionHeader from '../../Components/Home/SectionHeader';
import MessageBubble from '../../Components/Messages/MessageBubble';

const FEATURED = [
  { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'] },
  { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
  { id: 3, title: 'Cozy Family Home', price: 580000, location: 'Pasadena, CA', bedrooms: 3, bathrooms: 3, area: 2200, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
];

const MESSAGES = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    message: 'Is the property still available? I would love to schedule a viewing.',
    time: '2m',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop',
    property: { title: 'Luxury Villa with Pool', price: 1250000, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6' },
  },
  {
    id: 2,
    sender: 'Michael Chen',
    message: 'Thanks for the information about the apartment.',
    time: '1h',
    unreadCount: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Explore</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Discover amazing properties
        </Text>
      </View>

      <SectionHeader title="Featured Properties" />

      <FlatList
        data={FEATURED}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => router.push(`/property/${item.id}`)}
            onFavorite={() => {}}
          />
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />

      <SectionHeader title="Recent Messages" />

      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
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
    paddingTop: 8,
  },
});
