import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { List, Chip, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../Context/ThemeContext';
import NotificationService from '../../../Services/api/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await NotificationService.getNotifications();
        const data = response?.data || response || [];
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderItem = ({ item }) => (
    <Surface
      style={[
        styles.item,
        {
          backgroundColor: item.read ? theme.colors.surface : (theme.colors.primary + '15'),
          borderColor: theme.colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={() => markAsRead(item._id || item.id)}>
        <List.Item
          title={item.title}
          titleStyle={{ color: theme.colors.text, fontWeight: item.read ? '500' : '700' }}
          description={item.message}
          descriptionStyle={{ color: theme.colors.textSecondary }}
          left={(props) => (
            <List.Icon
              {...props}
              icon={item.read ? 'bell-outline' : 'bell'}
              color={theme.colors.primary}
            />
          )}
          right={(props) => (
            <Chip
              style={[styles.chip, { backgroundColor: theme.colors.primary + '20' }]}
              textStyle={{ color: theme.colors.primary, fontSize: 11 }}
            >
              {item.type || 'info'}
            </Chip>
          )}
        />
      </TouchableOpacity>
    </Surface>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item, index) => (item._id || item.id || index).toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
            No notifications yet
          </Text>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chip: {
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
});
