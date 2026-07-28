import React from 'react';
import { View, FlatList, ScrollView, StyleSheet, RefreshControl, Text } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  React.useEffect(() => {
    // TODO: Fetch featured properties and categories
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome!</Text>
        <Searchbar
          style={styles.searchBar}
          placeholder="Search properties..."
          onPress={() => router.push('/search')}
        />
      </View>

      <Text style={styles.sectionTitle}>Featured Properties</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Card style={styles.featuredCard} onPress={() => router.push('/property/1')}>
          <Card.Cover source={{ uri: 'https://via.placeholder.com/300x200' }} />
          <Title>Luxury Apartment</Title>
          <Paragraph>$250,000</Paragraph>
        </Card>
        <Card style={styles.featuredCard}>
          <Card.Cover source={{ uri: 'https://via.placeholder.com/300x200' }} />
          <Title>Modern Villa</Title>
          <Paragraph>$500,000</Paragraph>
        </Card>
      </ScrollView>

      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip style={styles.chip} onPress={() => router.push('/property/categories')}>Apartment</Chip>
        <Chip style={styles.chip}>House</Chip>
        <Chip style={styles.chip}>Land</Chip>
        <Chip style={styles.chip}>Commercial</Chip>
      </ScrollView>

      <Text style={styles.sectionTitle}>Recent Listings</Text>
      <Card style={styles.card} onPress={() => router.push('/property/1')}>
        <Card.Cover source={{ uri: 'https://via.placeholder.com/400x200' }} />
        <Card.Content>
          <Title>3 Bedroom Apartment</Title>
          <Paragraph>$150,000 - Downtown</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#fff' },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  searchBar: { elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', margin: 16, marginTop: 8 },
  featuredCard: { width: 250, marginHorizontal: 8, marginBottom: 8 },
  chip: { marginHorizontal: 4, marginBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 16 },
});