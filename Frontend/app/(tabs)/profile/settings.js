import React from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          PREFERENCES
        </Text>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
                <Icon name="moon" size={22} color={theme.colors.info} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Use dark theme
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Icon name="notifications" size={22} color={theme.colors.success} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Receive push notifications
                </Text>
              </View>
            </View>
            <Switch value={true} onValueChange={() => {}} />
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                <Icon name="mail" size={22} color={theme.colors.warning} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  Email Updates
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Receive email updates
                </Text>
              </View>
            </View>
            <Switch value={true} onValueChange={() => {}} />
          </View>
        </Surface>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/edit')}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="person-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Edit Profile
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Update your information
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/change-password')}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="lock-closed-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Change Password
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Update your password
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/profile/delete-account')}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Icon name="trash-outline" size={22} color={theme.colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.error }]}>
                Delete Account
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Permanently delete your account
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Surface>
      </View>

      <View style={{ height: theme.spacing.lg }} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
  },
  divider: {
    marginHorizontal: 16,
  },
});
