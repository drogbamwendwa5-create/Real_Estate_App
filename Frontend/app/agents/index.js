import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const AGENTS = [
  { 
    id: 1, 
    name: 'Sarah Johnson', 
    title: 'Senior Real Estate Agent',
    rating: 4.9, 
    reviewCount: 127, 
    properties: 45,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop',
    phone: '+1 234 567 890',
    email: 'sarah@example.com'
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    title: 'Luxury Property Specialist',
    rating: 4.8, 
    reviewCount: 98, 
    properties: 32,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    phone: '+1 234 567 891',
    email: 'michael@example.com'
  },
  { 
    id: 3, 
    name: 'Emily Rodriguez', 
    title: 'Residential Expert',
    rating: 5.0, 
    reviewCount: 156, 
    properties: 67,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    phone: '+1 234 567 892',
    email: 'emily@example.com'
  },
];

export default function AgentsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const renderAgent = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={() => router.push(`/agents/${item.id}`)}>
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={64} source={{ uri: item.avatar }} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {item.title}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Icon name="star" size={16} color={theme.colors.warning} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {item.rating}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ({item.reviewCount})
              </Text>
            </View>
            <View style={styles.stat}>
              <Icon name="home" size={16} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {item.properties}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                properties
              </Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward" size={24} color={theme.colors.textSecondary} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Our Agents
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Meet our team of professionals
          </Text>
        </View>
      </View>

      <FlatList
        data={AGENTS}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  card: {
    borderRadius: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 13,
  },
});
