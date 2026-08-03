import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';
import { useAuth } from '../Hooks/useAuth';
import { logout } from '../Services/api';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    favourites: 0,
    messages: 0,
  });

  useEffect(() => {
    // Fetch user stats
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            setUser(null);
            if (navigation) navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => navigation?.navigate('EditProfile'),
    },
    {
      icon: 'home-outline',
      title: 'My Properties',
      onPress: () => navigation?.navigate('CreateProperty'),
    },
    {
      icon: 'heart-outline',
      title: 'Favourites',
      onPress: () => {},
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Messages',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.avatarContainer}>
          {user?.avatar?.url ? (
            <Image source={{ uri: user.avatar.url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'USER'}</Text>
        </View>

        <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.properties}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Properties</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.favourites}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Favourites</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.messages}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Messages</Text>
          </View>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} 
              onPress={item.onPress}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.error }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
  },
  menuContainer: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
