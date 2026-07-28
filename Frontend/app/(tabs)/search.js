import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Text } from 'react-native-paper';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangeSearch = (query) => setSearchQuery(query);

  const renderProperty = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: 'https://via.placeholder.com/400x200' }} />
      <Card.Content>
        <Title>{item.title || 'Property Title'}</Title>
        <Paragraph>{item.price || '$100,000'}</Paragraph>
        <Text>{item.location || 'New York, NY'}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={[]}
      renderItem={renderProperty}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
      style={styles.container}
      ListHeaderComponent={
        <Searchbar
          placeholder="Search properties..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No properties found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  searchBar: { margin: 16, elevation: 2 },
  list: { padding: 16 },
  card: { marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748B' },
});