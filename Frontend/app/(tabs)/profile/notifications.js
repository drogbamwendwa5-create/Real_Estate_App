import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { List, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/notifications');
        const data = await response.json();
        setNotifications(data.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={item.title}
      description={item.message}
      left={(props) => <List.Icon {...props} icon={item.read ? 'bell-outline' : 'bell'} />}
      right={(props) => <Chip style={styles.chip}>{item.type}</Chip>}
      style={[styles.item, !item.read && styles.unreadItem]}
      onPress={() => markAsRead(item._id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications</Text>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#000' },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { backgroundColor: '#fff', marginBottom: 8 },
  unreadItem: { backgroundColor: '#EFF6FF' },
  chip: { alignSelf: 'flex-start' },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748B' },
});
