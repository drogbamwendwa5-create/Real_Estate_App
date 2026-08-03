import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';
import { useAuth } from '../Hooks/useAuth';

const SettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { setUser } = useAuth();

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  const menuItems = [
    {
      icon: 'lock-closed-outline',
      title: 'Change Password',
      subtitle: 'Update your account password',
      onPress: handleChangePassword,
      color: theme.colors.primary,
    },
    {
      icon: 'trash-outline',
      title: 'Delete Account',
      subtitle: 'Permanently delete your account',
      onPress: handleDeleteAccount,
      color: theme.colors.error,
      destructive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Manage your account settings and preferences
          </Text>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: theme.colors.surface }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                {
                  borderBottomColor: theme.colors.border,
                  backgroundColor: item.destructive ? theme.colors.error + '08' : 'transparent',
                },
              ]}
              onPress={item.onPress}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  {
                    backgroundColor: item.color + '15',
                  },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text
                  style={[
                    styles.menuTitle,
                    {
                      color: item.destructive ? theme.colors.error : theme.colors.text,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
  },
});

export default SettingsScreen;