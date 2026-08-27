import React from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, Button, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import PropertyCard from '../../Components/Property/PropertyCard';

const AGENT_DETAILS = {
  1: {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Real Estate Agent',
    rating: 4.9,
    reviewCount: 127,
    properties: 45,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop',
    phone: '+1 234 567 890',
    email: 'sarah@example.com',
    bio: 'With over 10 years of experience in luxury real estate, Sarah specializes in high-end properties in Beverly Hills and surrounding areas. Her extensive network and market knowledge ensure exceptional results for her clients.',
    propertiesList: [1, 2],
  },
  2: {
    id: 2,
    name: 'Michael Chen',
    title: 'Luxury Property Specialist',
    rating: 4.8,
    reviewCount: 98,
    properties: 32,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    phone: '+1 234 567 891',
    email: 'michael@example.com',
    bio: 'Michael is a luxury property specialist with a keen eye for architectural masterpieces. He has successfully closed over $500M in luxury transactions and is known for his discretion and personalized service.',
    propertiesList: [3],
  },
  3: {
    id: 3,
    name: 'Emily Rodriguez',
    title: 'Residential Expert',
    rating: 5.0,
    reviewCount: 156,
    properties: 67,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    phone: '+1 234 567 892',
    email: 'emily@example.com',
    bio: 'Emily is a residential expert with a passion for helping families find their dream homes. Her patient and thorough approach has earned her a perfect 5.0 rating from her clients.',
    propertiesList: [1, 3],
  },
};

const ALL_PROPERTIES = {
  1: { id: 1, title: 'Luxury Villa with Pool', price: 1250000, location: 'Beverly Hills, CA', bedrooms: 5, bathrooms: 4, area: 4500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'] },
  2: { id: 2, title: 'Modern Apartment Downtown', price: 750000, location: 'Los Angeles, CA', bedrooms: 2, bathrooms: 2, area: 1200, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'] },
  3: { id: 3, title: 'Cozy Family Home', price: 580000, location: 'Pasadena, CA', bedrooms: 3, bathrooms: 3, area: 2200, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'] },
};

export default function AgentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  
  const agent = AGENT_DETAILS[parseInt(id)] || AGENT_DETAILS[1];
  const agentProperties = agent.propertiesList.map(pid => ALL_PROPERTIES[pid]).filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
        style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-back" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Image size={100} source={{ uri: agent.avatar }} />
            <View style={[styles.ratingBadge, { backgroundColor: theme.colors.surface }]}>
              <Icon name="star" size={16} color={theme.colors.warning} />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {agent.rating}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {agent.name}
          </Text>
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {agent.title}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
              <Icon name="home" size={20} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {agent.properties}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Properties
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
              <Icon name="star" size={20} color={theme.colors.warning} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {agent.rating}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Rating
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: theme.colors.surface }]}>
              <Icon name="chatbubbles" size={20} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {agent.reviewCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Reviews
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About
          </Text>
          <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
            {agent.bio}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Information
          </Text>
          <Card style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.contactItem}>
                <Icon name="call" size={20} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>
                  {agent.phone}
                </Text>
              </View>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.contactItem}>
                <Icon name="mail" size={20} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>
                  {agent.email}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Listings ({agentProperties.length})
          </Text>
          {agentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPress={() => router.push(`/property/${property.id}`)}
              onFavorite={() => {}}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            icon="phone"
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => {}}
          >
            Call Agent
          </Button>
          <Button 
            mode="outlined" 
            icon="email"
            style={[styles.button, { borderColor: theme.colors.primary }]}
            onPress={() => {}}
          >
            Send Message
          </Button>
        </View>

        <View style={{ height: theme.spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactCard: {
    borderRadius: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  contactText: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
});