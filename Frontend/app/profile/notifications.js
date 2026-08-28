import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { List, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { position: 'absolute', top: 12, left: 14, zIndex: 10, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
    item: { backgroundColor: theme.colors.surface, marginBottom: 8 },
    unreadItem: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary },
    chip: { alignSelf: 'flex-start' },
    empty: { textAlign: 'center', marginTop: 32, color: theme.colors.textSecondary },
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // const response = await fetch('http://localhost:5000/api/notifications');
        const response = await fetch('https://real-estate-app-jvgi.onrender.com/api/notifications');
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
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications</Text>
        }
      />
    </View>
  );
}
