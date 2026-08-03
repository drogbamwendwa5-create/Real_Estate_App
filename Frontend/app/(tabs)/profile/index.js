import React, { useEffect, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction, updateUser } from '../../../store/slices/authSlice';
import authService from '../../../Services/api/authService';
import { useTheme } from '../../../Context/ThemeContext';

const canonicalRole = role => ({ user: 'buyer-tenant', agent: 'agency-professional' }[role] || role || 'guest');

const ROLE_NAMES = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  'agency-professional': 'Agency / Professional',
  'property-owner': 'Property Owner',
  'buyer-tenant': 'Buyer / Tenant',
  guest: 'Guest',
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const user = useSelector(state => state.auth.user);
  const role = canonicalRole(user?.role || user?.canonicalRole);
  const roleName = ROLE_NAMES[role] || 'Guest';

  const sections = useMemo(() => {
    if (role === 'super-admin') return [
      { title: 'Governance', items: [
        ['speedometer-outline', 'Control center', 'Platform operations', '/(tabs)/home'],
        ['people-outline', 'Users and roles', 'Manage access and promotions', '/(tabs)/admin-users'],
        ['shield-checkmark-outline', 'Verification queue', 'Approve pending requests', '/(tabs)/admin-review'],
        ['construct-outline', 'System tools', 'Flags, settings, and backups', '/(tabs)/admin-systems'],
        ['list-outline', 'Audit activity', 'Review security events', '/(tabs)/admin-audit'],
      ] },
      { title: 'Account', items: [
        ['create-outline', 'Edit profile', 'Update your personal details', '/(tabs)/profile/edit'],
        ['settings-outline', 'Settings', 'Security and preferences', '/(tabs)/profile/settings'],
      ] },
    ];
    if (role === 'admin') return [
      { title: 'Moderation', items: [
        ['checkmark-done-outline', 'Review queue', 'Verification requests', '/(tabs)/admin-review'],
        ['flag-outline', 'Reports', 'Triage marketplace reports', '/(tabs)/admin-reports'],
        ['bar-chart-outline', 'Analytics', 'Platform performance', '/admin/control-center?section=analytics'],
      ] },
      { title: 'Account', items: [
        ['create-outline', 'Edit profile', 'Update your personal details', '/(tabs)/profile/edit'],
        ['settings-outline', 'Settings', 'Security and preferences', '/(tabs)/profile/settings'],
      ] },
    ];
    if (role === 'agency-professional' || role === 'property-owner') return [
      { title: 'Workspace', items: [
        ['home-outline', 'My listings', 'Manage your portfolio', '/property/my-listings'],
        ['document-lock-outline', 'Verification', 'Build trust with buyers', '/verification/ownership'],
        ['chatbubbles-outline', 'Leads and inquiries', 'Respond to prospects', '/chat/inbox'],
      ] },
      { title: 'Account', items: [
        ['create-outline', 'Edit professional profile', 'Company, bio, and contact details', '/(tabs)/profile/edit'],
        ['settings-outline', 'Settings', 'Security and preferences', '/(tabs)/profile/settings'],
      ] },
    ];
    return [
      { title: 'Your activity', items: [
        ['heart-outline', 'Saved homes', 'View favourites and shortlists', '/property/saved'],
        ['chatbubbles-outline', 'Messages', 'Talk to owners and agents', '/chat/inbox'],
        ['notifications-outline', 'Notifications', 'Stay up to date', '/(tabs)/profile/notifications'],
        ['briefcase-outline', 'Apply as an agent', 'Get approved to publish listings', '/verification/agent-application'],
      ] },
      { title: 'Account', items: [
        ['create-outline', 'Edit profile', 'Update your personal details', '/(tabs)/profile/edit'],
        ['settings-outline', 'Settings', 'Security and preferences', '/(tabs)/profile/settings'],
      ] },
    ];
  }, [role]);

  const logout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { dispatch(logoutAction()); router.replace('/auth/login'); } },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>{(user?.name || 'G').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: theme.colors.text }]} selectable>{user?.name || 'Guest'}</Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]} selectable>{user?.email || 'Browse without an account'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '18' }]}>
              <Ionicons name={role === 'super-admin' ? 'shield-checkmark' : 'person-circle-outline'} size={14} color={theme.colors.primary} />
              <Text style={[styles.roleText, { color: theme.colors.primary }]}>{roleName}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/profile/edit')} style={styles.editButton}><Ionicons name="create-outline" size={20} color={theme.colors.primary} /></Pressable>
        </View>

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {section.items.map(([icon, title, description, route], index) => (
                <React.Fragment key={title}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.colors.border }]} /> : null}
                  <Pressable onPress={() => router.push(route)} style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.65 : 1 }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '16' }]}><Ionicons name={icon} size={20} color={theme.colors.primary} /></View>
                    <View style={styles.menuCopy}><Text style={[styles.menuTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>{description}</Text></View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                  </Pressable>
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <Pressable onPress={logout} style={[styles.logout, { borderColor: theme.colors.error }]}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 18, paddingBottom: 100, gap: 18 },
  profileCard: { borderRadius: 22, borderWidth: 1, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 25, fontWeight: '900' },
  profileCopy: { flex: 1, gap: 3 },
  name: { fontSize: 21, fontWeight: '900' },
  email: { fontSize: 12 },
  roleBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '800' },
  editButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  section: { gap: 7 },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '800', marginLeft: 4 },
  menuCard: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  menuItem: { minHeight: 70, flexDirection: 'row', alignItems: 'center', padding: 13, gap: 11 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1, gap: 3 },
  menuTitle: { fontSize: 15, fontWeight: '800' },
  menuDescription: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1, marginLeft: 62 },
  logout: { minHeight: 50, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { fontSize: 14, fontWeight: '800' },
});