import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image } from 'react-native';
import { List, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.avatar} />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>
      </View>

      <List.Section>
        <List.Item
          title="My Listings"
          description="Manage your properties"
          left={(props) => <List.Icon {...props} icon="home" />}
          onPress={() => router.push('/property/my-listings')}
        />
        <Divider />
        <List.Item
          title="Saved Properties"
          description="View your favourites"
          left={(props) => <List.Icon {...props} icon="heart" />}
          onPress={() => router.push('/property/saved')}
        />
        <Divider />
        <List.Item
          title="Settings"
          description="App preferences"
          left={(props) => <List.Icon {...props} icon="cog" />}
          onPress={() => router.push('/profile/settings')}
        />
        <Divider />
        <List.Item
          title="Notifications"
          description="Manage notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          onPress={() => router.push('/profile/notifications')}
        />
        <Divider />
        <List.Item
          title="Help & Support"
          description="FAQ and contact"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          onPress={() => router.push('/profile/help')}
        />
        <Divider />
        <List.Item
          title="About"
          description="App information"
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => router.push('/profile/about')}
        />
      </List.Section>

      <Button mode="outlined" style={styles.logout} onPress={() => {}}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  email: { fontSize: 14, color: '#64748B', marginTop: 4 },
  logout: { margin: 16 },
});