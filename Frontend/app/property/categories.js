import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';

const categories = [
  { id: '1', name: 'Apartment', icon: 'home', count: 120 },
  { id: '2', name: 'House', icon: 'home', count: 85 },
  { id: '3', name: 'Land', icon: 'map', count: 45 },
  { id: '4', name: 'Commercial', icon: 'office-building', count: 32 },
  { id: '5', name: 'Condo', icon: 'home', count: 67 },
  { id: '6', name: 'Townhouse', icon: 'home', count: 28 },
];

export default function CategoriesScreen() {
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
        <Text style={styles.header}>Browse by Category</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { flex: 1, margin: 8, minWidth: 150 },
  cardContent: { alignItems: 'center', padding: 16 },
  chip: { marginBottom: 8 },
  title: { fontSize: 16, textAlign: 'center' },
  count: { fontSize: 12, color: '#64748B', textAlign: 'center' },
});
