import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: '1', name: 'Apartment', icon: 'home', count: 120 },
  { id: '2', name: 'House', icon: 'home', count: 85 },
  { id: '3', name: 'Land', icon: 'map', count: 45 },
  { id: '4', name: 'Commercial', icon: 'office-building', count: 32 },
  { id: '5', name: 'Condo', icon: 'home', count: 67 },
  { id: '6', name: 'Townhouse', icon: 'home', count: 28 },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const renderCategory = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Chip style={styles.chip}>{item.icon}</Chip>
        <Title style={styles.title}>{item.name}</Title>
        <Paragraph style={styles.count}>{item.count} listings</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      numColumns={2}
      ListHeaderComponent={
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#2563EB" />
          </TouchableOpacity>
          <Text style={styles.header}>Browse by Category</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  card: { flex: 1, margin: 8, minWidth: 150 },
  cardContent: { alignItems: 'center', padding: 16 },
  chip: { marginBottom: 8 },
  title: { fontSize: 16, textAlign: 'center' },
  count: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
