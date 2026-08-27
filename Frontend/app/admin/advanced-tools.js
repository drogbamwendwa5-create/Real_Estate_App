import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../Context/ThemeContext';
import {
  createSuperAdminBackup,
  getSuperAdminAnalytics,
  getSuperAdminFeatureFlags,
  getSuperAdminOverview,
  getSuperAdminRoles,
  getSuperAdminSettings,
  updateSuperAdminFeatureFlag,
  updateSuperAdminSettings,
} from '../../Services/api';

const canonicalRole = role => ({ user: 'buyer-tenant', agent: 'agency-professional' }[role] || role || 'guest');

const FLAG_LABELS = {
  enableVirtualTours: 'Virtual tours',
  enableInvestmentScores: 'Investment scores',
  enableAIModeration: 'AI moderation',
  enableGeospatialEnrichment: 'Geospatial enrichment',
  enableFraudDetection: 'Fraud detection',
  enableBiddingSystem: 'Bidding system',
  enableSubscriptionPayments: 'Subscription payments',
  enableEmailNotifications: 'Email notifications',
  enableSMSNotifications: 'SMS notifications',
  maintenanceMode: 'Maintenance mode',
};

const SETTING_LABELS = {
  verificationRequiredForListing: 'Require verification before listing',
  autoApproveVerifiedAgents: 'Auto-approve verified agents',
};

const PANEL_TABS = [
  ['flags', 'Feature flags', 'flask-outline'],
  ['settings', 'Settings', 'settings-outline'],
  ['roles', 'Roles', 'lock-closed-outline'],
  ['analytics', 'Analytics', 'bar-chart-outline'],
];

const humanize = key => FLAG_LABELS[key] || SETTING_LABELS[key] || key
  .replace(/([A-Z])/g, ' $1')
  .replace(/[_-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^\w/, c => c.toUpperCase());

export default function AdvancedTools({ embedded = false } = {}) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const role = canonicalRole(user?.role || user?.canonicalRole);
  const isSuper = role === 'super-admin';

  const [overview, setOverview] = useState(null);
  const [roles, setRoles] = useState([]);
  const [flags, setFlags] = useState({});
  const [settings, setSettings] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [panel, setPanel] = useState('flags');
  const [loading, setLoading] = useState(isSuper);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [busyKey, setBusyKey] = useState(null);

  const flash = (text, tone = 'info') => {
    setMessage(text);
    setMessageTone(tone);
  };

  const load = useCallback(async ({ soft = false } = {}) => {
    if (!isSuper) return;
    if (!soft) setLoading(true);
    try {
      const [overviewResponse, rolesResponse, flagsResponse, settingsResponse, analyticsResponse] = await Promise.all([
        getSuperAdminOverview(),
        getSuperAdminRoles(),
        getSuperAdminFeatureFlags(),
        getSuperAdminSettings(),
        getSuperAdminAnalytics(),
      ]);
      setOverview(overviewResponse?.data || overviewResponse);
      setRoles(rolesResponse?.data || []);
      setFlags(flagsResponse?.data || {});
      setSettings(settingsResponse?.data || settingsResponse);
      setAnalytics(analyticsResponse?.data || analyticsResponse);
    } catch (error) {
      flash(error?.response?.data?.message || 'Some advanced controls are unavailable.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSuper]);

  useEffect(() => { load(); }, [load]);

  const runBackup = async () => {
    setBusyKey('backup');
    try {
      await createSuperAdminBackup();
      flash('Database backup requested successfully.', 'success');
    } catch (error) {
      flash(error?.response?.data?.message || 'Backup request failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const toggleFlag = async flag => {
    setBusyKey(flag);
    try {
      const value = !flags[flag];
      await updateSuperAdminFeatureFlag(flag, value);
      setFlags({ ...flags, [flag]: value });
      flash(`${humanize(flag)} ${value ? 'enabled' : 'disabled'}.`, 'success');
    } catch (error) {
      flash(error?.response?.data?.message || 'Feature flag update failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const toggleSetting = async key => {
    setBusyKey(key);
    try {
      const value = !settings?.[key];
      const next = { ...settings, [key]: value };
      await updateSuperAdminSettings(next);
      setSettings(next);
      flash(`${humanize(key)} updated.`, 'success');
    } catch (error) {
      flash(error?.response?.data?.message || 'Settings update failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const totals = overview?.totals || overview || {};
  const metrics = [
    { label: 'Users', value: totals.totalUsers ?? overview?.users, icon: 'people-outline' },
    { label: 'Listings', value: totals.totalProperties ?? overview?.listings, icon: 'home-outline' },
    { label: 'Pending', value: totals.pendingVerifications, icon: 'shield-outline' },
    { label: 'Roles', value: roles.length || totals.totalAdmins, icon: 'lock-closed-outline' },
  ];

  if (!isSuper) {
    const links = role === 'admin'
      ? [
          ['Listing moderation', 'home-outline', '/admin/control-center?section=listings'],
          ['Verification queue', 'shield-checkmark-outline', '/admin/control-center?section=verification'],
          ['Reports & safety', 'flag-outline', '/admin/control-center?section=reports'],
        ]
      : [
          ['Manage portfolio', 'business-outline', '/property/my-listings'],
          ['Lead inbox', 'chatbubbles-outline', '/chat/inbox'],
          ['Create listing', 'add-circle-outline', '/listing/create'],
        ];

    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ title: 'Tools', headerShown: false }} />
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 16) + 12, paddingBottom: 40 + insets.bottom }]}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} style={styles.backPlain}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.plainTitle, { color: theme.colors.text }]}>{role === 'admin' ? 'Moderation tools' : 'Professional workspace'}</Text>
          <Text style={[styles.plainSubtitle, { color: theme.colors.textSecondary }]}>Shortcuts for your role.</Text>
          <View style={styles.linkList}>
            {links.map(([label, icon, href]) => (
              <Pressable key={label} onPress={() => router.push(href)} style={[styles.linkCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.linkIcon, { backgroundColor: theme.colors.primary + '14' }]}>
                  <Ionicons name={icon} size={18} color={theme.colors.primary} />
                </View>
                <Text style={[styles.linkLabel, { color: theme.colors.text }]}>{label}</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'System tools', headerShown: false }} />

      <LinearGradient colors={['#0B1220', '#152238']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: Math.max(insets.top, 16) + (embedded ? 4 : 8) }]}>
        <View style={styles.heroTop}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} style={styles.heroIconBtn}>
            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
          </Pressable>
          <View style={styles.heroBadge}>
            <Ionicons name="construct" size={13} color="#F8FAFC" />
            <Text style={styles.heroBadgeText}>SYSTEM</Text>
          </View>
          <Pressable onPress={() => { setRefreshing(true); load({ soft: true }); }} style={styles.heroIconBtn}>
            <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
          </Pressable>
        </View>
        <Text style={styles.heroTitle}>Platform systems</Text>
        <Text style={styles.heroSubtitle}>Feature flags, settings, roles, analytics, and backups.</Text>
        <Pressable onPress={runBackup} disabled={busyKey === 'backup'} style={[styles.backupBtn, busyKey === 'backup' && { opacity: 0.7 }]}>
          <Ionicons name="cloud-upload-outline" size={16} color="#0B1220" />
          <Text style={styles.backupBtnText}>{busyKey === 'backup' ? 'Requesting…' : 'Create database backup'}</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 40 + insets.bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load({ soft: true }); }} tintColor={theme.colors.primary} />}
      >
        {message ? (
          <View style={[styles.toast, { backgroundColor: messageTone === 'error' ? '#FEE2E2' : messageTone === 'success' ? '#DCFCE7' : theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons
              name={messageTone === 'error' ? 'alert-circle' : messageTone === 'success' ? 'checkmark-circle' : 'information-circle'}
              size={18}
              color={messageTone === 'error' ? '#991B1B' : messageTone === 'success' ? '#166534' : theme.colors.primary}
            />
            <Text style={[styles.toastText, { color: theme.colors.text }]}>{message}</Text>
            <Pressable onPress={() => setMessage('')}><Ionicons name="close" size={16} color={theme.colors.textSecondary} /></Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading system controls…</Text>
          </View>
        ) : (
          <>
            <View style={styles.metricGrid}>
              {metrics.map(metric => (
                <View key={metric.label} style={[styles.metricCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <View style={[styles.metricIcon, { backgroundColor: '#0B122012' }]}>
                    <Ionicons name={metric.icon} size={15} color="#0B1220" />
                  </View>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metric.value ?? '—'}</Text>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
              {PANEL_TABS.map(([key, label, icon]) => {
                const active = panel === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setPanel(key)}
                    style={[styles.tab, { backgroundColor: active ? theme.colors.text : theme.colors.card, borderColor: active ? theme.colors.text : theme.colors.border }]}
                  >
                    <Ionicons name={icon} size={14} color={active ? theme.colors.background : theme.colors.textSecondary} />
                    <Text style={[styles.tabText, { color: active ? theme.colors.background : theme.colors.text }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {panel === 'flags' ? (
              <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Feature flags</Text>
                <Text style={[styles.panelHint, { color: theme.colors.textSecondary }]}>Toggle platform capabilities without a deploy.</Text>
                {Object.keys(flags).length === 0 ? (
                  <Text style={[styles.emptyLine, { color: theme.colors.textSecondary }]}>No feature flags configured.</Text>
                ) : Object.entries(flags).map(([flag, value]) => (
                  <Pressable key={flag} onPress={() => toggleFlag(flag)} disabled={busyKey === flag} style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.switchLabel, { color: theme.colors.text }]}>{humanize(flag)}</Text>
                      <Text style={[styles.switchKey, { color: theme.colors.textMuted }]}>{flag}</Text>
                    </View>
                    <View style={[styles.switchTrack, { backgroundColor: value ? '#166534' : theme.colors.border }]}>
                      <Text style={styles.switchTrackText}>{busyKey === flag ? '…' : value ? 'ON' : 'OFF'}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {panel === 'settings' ? (
              <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.panelTitle, { color: theme.colors.text }]}>System settings</Text>
                <Text style={[styles.panelHint, { color: theme.colors.textSecondary }]}>Core marketplace policy controls.</Text>
                {!settings ? (
                  <Text style={[styles.emptyLine, { color: theme.colors.textSecondary }]}>Settings unavailable.</Text>
                ) : (
                  <>
                    {Object.keys(SETTING_LABELS).map(key => (
                      <Pressable key={key} onPress={() => toggleSetting(key)} disabled={busyKey === key} style={styles.switchRow}>
                        <Text style={[styles.switchLabel, { color: theme.colors.text, flex: 1 }]}>{SETTING_LABELS[key]}</Text>
                        <View style={[styles.switchTrack, { backgroundColor: settings[key] ? '#166534' : theme.colors.border }]}>
                          <Text style={styles.switchTrackText}>{busyKey === key ? '…' : settings[key] ? 'ON' : 'OFF'}</Text>
                        </View>
                      </Pressable>
                    ))}
                    <View style={[styles.infoStrip, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.infoStripText, { color: theme.colors.textSecondary }]}>
                        Currency: {settings.defaultCurrency || '—'} · Free listings: {settings.maxListingsPerFreeUser ?? '—'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ) : null}

            {panel === 'roles' ? (
              <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Roles & permissions</Text>
                <Text style={[styles.panelHint, { color: theme.colors.textSecondary }]}>System role definitions currently loaded.</Text>
                {roles.length === 0 ? (
                  <Text style={[styles.emptyLine, { color: theme.colors.textSecondary }]}>No roles returned.</Text>
                ) : roles.map(item => (
                  <View key={item._id || item.key} style={[styles.roleRow, { borderColor: theme.colors.border }]}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.switchLabel, { color: theme.colors.text }]}>{item.name || humanize(item.key)}</Text>
                      <Text style={[styles.switchKey, { color: theme.colors.textMuted }]}>{item.key}</Text>
                    </View>
                    <View style={[styles.permPill, { backgroundColor: theme.colors.surface }]}>
                      <Text style={[styles.permPillText, { color: theme.colors.textSecondary }]}>{item.permissions?.length || 0} perms</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {panel === 'analytics' ? (
              <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.panelTitle, { color: theme.colors.text }]}>30-day analytics</Text>
                <Text style={[styles.panelHint, { color: theme.colors.textSecondary }]}>Recent platform growth snapshot.</Text>
                <View style={styles.analyticsGrid}>
                  <Analytic label="New users" value={analytics?.metrics?.newUsers} theme={theme} />
                  <Analytic label="New listings" value={analytics?.metrics?.newProperties} theme={theme} />
                  <Analytic label="Revenue" value={analytics?.metrics?.totalRevenue} theme={theme} />
                </View>
              </View>
            ) : null}

            {!embedded ? (
              <Pressable onPress={() => router.push('/admin/control-center')} style={[styles.footerLink, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <Ionicons name="speedometer-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.footerLinkText, { color: theme.colors.text }]}>Back to control center</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Analytic({ label, value, theme }) {
  return (
    <View style={[styles.analyticCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.analyticValue, { color: theme.colors.text }]}>{value ?? '—'}</Text>
      <Text style={[styles.analyticLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 22, gap: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF14' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#FFFFFF18' },
  heroBadgeText: { color: '#F8FAFC', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heroTitle: { color: '#F8FAFC', fontSize: 30, fontWeight: '800', letterSpacing: -0.4 },
  heroSubtitle: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
  backupBtn: { alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  backupBtnText: { color: '#0B1220', fontSize: 13, fontWeight: '800' },
  content: { padding: 16, gap: 12 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  toastText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  loadingBlock: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  loadingText: { fontSize: 13, fontWeight: '600' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '47%', flexGrow: 1, minWidth: 140, borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  metricIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  metricLabel: { fontSize: 12, fontWeight: '700' },
  tabRow: { gap: 8, paddingVertical: 2 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  tabText: { fontSize: 13, fontWeight: '700' },
  panel: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  panelTitle: { fontSize: 18, fontWeight: '800' },
  panelHint: { fontSize: 13, lineHeight: 19, marginTop: -6 },
  emptyLine: { fontSize: 13, paddingVertical: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  switchLabel: { fontSize: 14, fontWeight: '700' },
  switchKey: { fontSize: 11, fontWeight: '600' },
  switchTrack: { minWidth: 52, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center' },
  switchTrackText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  infoStrip: { borderRadius: 12, padding: 12 },
  infoStripText: { fontSize: 13, lineHeight: 18 },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  permPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  permPillText: { fontSize: 11, fontWeight: '800' },
  analyticsGrid: { gap: 10 },
  analyticCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  analyticValue: { fontSize: 24, fontWeight: '800' },
  analyticLabel: { fontSize: 12, fontWeight: '700' },
  footerLink: { marginTop: 4, borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerLinkText: { flex: 1, fontSize: 14, fontWeight: '800' },
  backPlain: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  plainTitle: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  plainSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  linkList: { gap: 10 },
  linkCard: { minHeight: 64, borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '800' },
});
