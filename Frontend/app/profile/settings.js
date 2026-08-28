import React, { useState } from 'react';
import { Alert, View, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { List, Button, Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { logout as logoutApi } from '../../Services/api';
import { logout as logoutAction } from '../../store/slices/authSlice';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: theme.colors.background },
    headerRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
    backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
    logout: { margin: 16 },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Dark Mode"
          right={() => <Switch value={darkMode} onValueChange={setDarkMode} />}
        />
        <Divider />
        <List.Item
          title="Push Notifications"
          right={() => <Switch value={notifications} onValueChange={setNotifications} />}
        />
        <Divider />
        <List.Item
          title="Email Updates"
          right={() => <Switch value={emailUpdates} onValueChange={setEmailUpdates} />}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Edit Profile"
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          onPress={() => router.push('/profile/edit')}
        />
        <Divider />
        <List.Item
          title="Change Password"
          left={(props) => <List.Icon {...props} icon="lock-reset" />}
          onPress={() => {}}
        />
        <Divider />
        <List.Item
          title="Delete Account"
          left={(props) => <List.Icon {...props} icon="delete" />}
          onPress={() => {}}
        />
      </List.Section>

      <Button
        mode="outlined"
        style={styles.logout}
        onPress={() => {
          Alert.alert('Log out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Log out',
              style: 'destructive',
              onPress: async () => {
                await logoutApi();
                dispatch(logoutAction());
                router.replace('/auth/login');
              },
            },
          ]);
        }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}
