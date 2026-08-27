import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropertyCard from '../../Components/Property/PropertyCard';
import MessageBubble from '../../Components/Messages/MessageBubble';

const CATEGORIES = [
  { label: 'Homes', icon: 'home-outline', color: '#2563EB' },
  { label: 'Apartments', icon: 'business-outline', color: '#7C3AED' },
  { label: 'Land', icon: 'map-outline', color: '#059669' },
  { label: 'Commercial', icon: 'briefcase-outline', color: '#EA580C' },
];

const FEATURED = [
  { id: 1, title: 'Luxury Villa - Runda', price: 85000000, location: 'Runda, Nairobi', bedrooms: 5, bathrooms: 4, area: 450, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'] },
  { id: 2, title: 'Modern Apartment - Westlands', price: 18000000, location: 'Westlands, Nairobi', bedrooms: 2, bathrooms: 2, area: 120, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
  { id: 3, title: 'Cozy Family Home - Lavington', price: 35000000, location: 'Lavington, Nairobi', bedrooms: 3, bathrooms: 3, area: 220, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
];

const MESSAGES = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    message: 'Is the property still available? I would love to schedule a viewing.',
    time: '2m',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop',
    property: { title: 'Luxury Villa - Runda', price: 85000000, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6' },
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
  const { width } = useWindowDimensions();

  const handleNavigate = (route) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
    router.push(route);
  };

  const cardWidth = useMemo(() => {
    if (width >= 1280) return 320;
    if (width >= 768) return 300;
    return Math.min(300, Math.max(260, width * 0.76));
  }, [width]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
              style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>DISCOVER MORE</Text>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Explore</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Find spaces that fit your next chapter.</Text>
          </View>
          <TouchableOpacity
            style={[styles.mapButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            onPress={() => handleNavigate('/map')}
            accessibilityRole="button"
            accessibilityLabel="Open map"
          >
            <Ionicons name="map-outline" size={21} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>SMARTER SEARCH</Text>
            <Text style={styles.heroTitle}>Your place is out there.</Text>
            <Text style={styles.heroSubtitle}>Browse curated listings or search the whole map.</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => handleNavigate('/(tabs)/search')}>
              <Text style={[styles.heroButtonText, { color: theme.colors.primary }]}>Start exploring</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Ionicons name="sparkles-outline" size={82} color="rgba(255,255,255,0.18)" style={styles.heroIcon} />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Browse by type</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={[styles.category, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => handleNavigate('/(tabs)/search')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}18` }]}>
                <Ionicons name={category.icon} size={21} color={category.color} />
              </View>
              <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Curated for you</Text>
          <TouchableOpacity onPress={() => handleNavigate('/(tabs)/search')}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyRow}>
          {FEATURED.map((property) => (
            <View key={property.id} style={[styles.propertyItem, { width: cardWidth }]}>
              <PropertyCard property={property} onPress={() => handleNavigate(`/property/${property.id}`)} />
            </View>
          ))}
        </ScrollView>

        <View style={[styles.sectionHeading, styles.messageHeading]}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Stay in the loop</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Your latest conversations</Text>
          </View>
          <TouchableOpacity onPress={() => handleNavigate('/chat')}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>Messages</Text>
          </TouchableOpacity>
        </View>
        {MESSAGES.map((message) => (
          <MessageBubble key={message.id} message={message} onPress={() => handleNavigate(`/chat/${message.id}`)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 104 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
  headerTitle: { fontSize: 34, lineHeight: 38, fontWeight: '800' },
  headerSubtitle: { fontSize: 15, marginTop: 6 },
  mapButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  hero: { marginHorizontal: 20, minHeight: 174, borderRadius: 24, padding: 22, overflow: 'hidden', position: 'relative' },
  heroCopy: { maxWidth: '78%', zIndex: 1 },
  heroEyebrow: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, lineHeight: 29, fontWeight: '800', marginTop: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 19, marginTop: 6 },
  heroButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, marginTop: 16 },
  heroButtonText: { fontSize: 13, fontWeight: '800' },
  heroIcon: { position: 'absolute', right: -8, bottom: -5, transform: [{ rotate: '-15deg' }] },
  sectionHeading: { marginTop: 28, marginBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 13, marginTop: 3 },
  viewAll: { fontSize: 14, fontWeight: '700' },
  categoryRow: { paddingHorizontal: 20, gap: 10 },
  category: { width: 106, borderRadius: 16, borderWidth: 1, padding: 12, gap: 10 },
  categoryIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 12, fontWeight: '700' },
  propertyRow: { paddingHorizontal: 20, gap: 12 },
  propertyItem: { width: 292 },
  messageHeading: { marginTop: 30 },
});
