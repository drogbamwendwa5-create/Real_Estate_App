import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { List, Button, Text, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <ScrollView style={styles.container}>
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

      <Button mode="outlined" style={styles.logout} onPress={() => {}}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  logout: { margin: 16 },
});
