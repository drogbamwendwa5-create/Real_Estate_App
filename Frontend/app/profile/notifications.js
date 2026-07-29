import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { List, Button, Chip } from 'react-native-paper';

export default function NotificationsScreen() {
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
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={styles.empty}>No notifications</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { backgroundColor: '#fff', marginBottom: 8 },
  unreadItem: { backgroundColor: '#EFF6FF' },
  chip: { alignSelf: 'flex-start' },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748B' },
});
