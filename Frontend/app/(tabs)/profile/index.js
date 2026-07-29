import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Divider, Surface, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const displayName = user?.name || (isAuthenticated ? 'User' : 'Guest');
  const displayEmail = user?.email || (isAuthenticated ? 'user@example.com' : '');
  const avatarUrl = user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;

  const handleLogout = () => {
    dispatch(logoutAction());
    router.replace('/auth/login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Surface style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.avatarContainer}>
            <Avatar.Image size={80} source={{ uri: avatarUrl }} />
            {isAuthenticated && (
              <TouchableOpacity style={styles.editAvatarButton}>
                <Icon name="camera" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {displayEmail}
          </Text>
          {isAuthenticated && (
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push('./edit')}
            >
              <Icon name="pencil" size={16} color={theme.colors.primary} />
              <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </Surface>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Account
        </Text>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('./my-listings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="home" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                My Listings
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Manage your properties
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('../saved')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Icon name="heart" size={22} color={theme.colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Saved Properties
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                View your favourites
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('./settings')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
              <Icon name="settings" size={22} color={theme.colors.info} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Settings
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                App preferences
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Surface>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Support
        </Text>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('./notifications')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
              <Icon name="notifications" size={22} color={theme.colors.warning} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Manage notifications
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('./help')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="help-circle" size={22} color={theme.colors.success} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                Help & Support
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                FAQ and contact
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('./about')}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="information-circle" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                About
              </Text>
              <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                App information
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Surface>
      </View>

      <TouchableOpacity 
        style={[styles.deleteAccountButton, { borderColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Icon name="log-out" size={20} color={theme.colors.error} />
        <Text style={[styles.deleteAccountText, { color: theme.colors.error }]}>
          Logout
        </Text>
      </TouchableOpacity>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
