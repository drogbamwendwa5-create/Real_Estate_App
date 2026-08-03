import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../Context/ThemeContext';
import {
  getAdminDashboard,
  getAdminProperties,
  getAdminUsers,
  getAuditActivity,
  getReports,
  getSuperAdminOverview,
  getVerificationQueue,
  manageAdminProperty,
  reviewVerification,
  updateAdminUser,
} from '../../Services/api';

const canonicalRole = role => ({ user: 'buyer-tenant', agent: 'agency-professional' }[role] || role || 'guest');

const ROLE_LABELS = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  'agency-professional': 'Agency',
  'property-owner': 'Owner',
  'buyer-tenant': 'Buyer / Tenant',
  user: 'Buyer / Tenant',
};

const SECTION_ICONS = {
  overview: 'grid-outline',
  users: 'people-outline',
  listings: 'home-outline',
  verification: 'shield-checkmark-outline',
  reports: 'flag-outline',
  audit: 'list-outline',
  analytics: 'bar-chart-outline',
};

const formatWhen = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isSuspended = item => Boolean(item?.suspendedAt) || item?.isActive === false;

export default function ControlCenter({ forcedSection = null, embedded = false } = {}) {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const user = useSelector(state => state.auth.user);
  const role = canonicalRole(user?.role || user?.canonicalRole);
  const isSuper = role === 'super-admin';

  const sections = useMemo(() => (isSuper
    ? [
        ['overview', 'Overview'],
        ['users', 'Users'],
        ['listings', 'Listings'],
        ['verification', 'Verification'],
        ['reports', 'Reports'],
        ['audit', 'Audit'],
        ['analytics', 'Analytics'],
      ]
    : [
        ['verification', 'Verification'],
        ['listings', 'Listings'],
        ['reports', 'Reports'],
        ['analytics', 'Analytics'],
      ]), [isSuper]);

  const initialSection = useMemo(() => {
    if (forcedSection && sections.some(([key]) => key === forcedSection)) return forcedSection;
    const requested = Array.isArray(params.section) ? params.section[0] : params.section;
    if (requested && sections.some(([key]) => key === requested)) return requested;
    return isSuper ? 'overview' : 'verification';
  }, [forcedSection, params.section, sections, isSuper]);

  const [section, setSection] = useState(initialSection);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [userQuery, setUserQuery] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { setSection(initialSection); }, [initialSection]);

  const selectSection = key => {
    setSection(key);
    if (!embedded && !forcedSection) router.setParams({ section: key });
  };

  const sectionTitle = {
    overview: isSuper ? 'Platform control' : 'Moderation desk',
    users: 'User management',
    listings: 'Listing moderation',
    verification: 'Verification queue',
    reports: 'Safety reports',
    audit: 'Audit trail',
    analytics: 'Analytics',
  }[section] || (isSuper ? 'Platform control' : 'Moderation desk');

  const sectionSubtitle = {
    overview: isSuper
      ? 'Users, listings, verification, audit, and system health in one workspace.'
      : 'Review listings, verification requests, and safety reports.',
    users: 'Search accounts, change roles, and suspend access.',
    listings: 'Publish or hide marketplace listings.',
    verification: 'Approve or reject pending verification requests.',
    reports: 'Triage marketplace safety reports.',
    audit: 'Inspect recent security and admin events.',
    analytics: 'Platform totals and performance snapshot.',
  }[section] || '';

  const flash = (text, tone = 'info') => {
    setMessage(text);
    setMessageTone(tone);
  };

  const load = useCallback(async ({ soft = false } = {}) => {
    if (!soft) setLoading(true);
    setMessage('');
    try {
      if (section === 'overview') {
        if (isSuper) {
          const response = await getSuperAdminOverview();
          const payload = response?.data || response || {};
          setStats({
            totalUsers: payload.totals?.totalUsers ?? payload.totalUsers,
            totalProperties: payload.totals?.totalProperties ?? payload.totalProperties,
            openReports: payload.totals?.openReports,
            pendingVerifications: payload.totals?.pendingVerifications,
          });
        } else {
          const response = await getAdminDashboard();
          setStats(response?.data || response || {});
        }
        setData([]);
      } else if (section === 'analytics') {
        const response = await getAdminDashboard();
        setStats(response?.data || response || {});
        setData([]);
      } else {
        let response;
        if (section === 'users') response = await getAdminUsers({ limit: 1000 });
        else if (section === 'listings') response = await getAdminProperties({ limit: 100 });
        else if (section === 'reports') response = await getReports({ limit: 40 });
        else if (section === 'audit') response = await getAuditActivity({ limit: 40 });
        else response = await getVerificationQueue({ status: 'pending', limit: 40 });
        setData(Array.isArray(response?.data) ? response.data : []);
      }
    } catch (error) {
      flash(error?.response?.data?.message || 'This control is unavailable for your current permissions.', 'error');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [section, isSuper]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (id, action, successMessage) => {
    setBusyId(id);
    try {
      await action();
      flash(successMessage, 'success');
      await load({ soft: true });
    } catch (error) {
      flash(error?.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleReview = (id, status) => runAction(id, () => reviewVerification(id, { status }), status === 'approved' ? 'Verification approved.' : 'Verification rejected.');
  const handlePromote = (id, nextRole) => runAction(id, () => updateAdminUser(id, { role: nextRole }), `Role updated to ${ROLE_LABELS[nextRole] || nextRole}.`);
  const handleToggleUser = item => {
    const suspended = isSuspended(item);
    return runAction(
      item._id,
      () => updateAdminUser(item._id, { isActive: suspended, suspendedAt: suspended ? null : new Date().toISOString() }),
      suspended ? 'User activated.' : 'User suspended.'
    );
  };
  const handlePropertyUpdate = (id, changes, successMessage) => runAction(id, () => manageAdminProperty(id, changes), successMessage);

  const visibleData = useMemo(() => {
    if (section !== 'users' || !userQuery.trim()) return data;
    const query = userQuery.trim().toLowerCase();
    return data.filter(item => [item.name, item.email, item.role, item.canonicalRole]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query)));
  }, [data, section, userQuery]);

  const overviewMetrics = [
    { label: 'Users', value: stats?.totalUsers, icon: 'people-outline' },
    { label: 'Listings', value: stats?.totalProperties, icon: 'home-outline' },
    { label: 'Reports', value: stats?.openReports ?? stats?.totalReports, icon: 'flag-outline' },
    { label: 'Pending', value: stats?.pendingVerifications ?? stats?.pendingReviews, icon: 'shield-outline' },
  ];

  const ink = isSuper ? ['#0B1220', '#152238'] : [theme.colors.primary, theme.colors.secondary || theme.colors.primary];

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {!embedded ? <Stack.Screen options={{ title: isSuper ? 'Super Admin' : 'Admin Control', headerShown: false }} /> : null}

      <LinearGradient colors={ink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: Math.max(insets.top, 16) + (embedded ? 4 : 8) }]}>
        <View style={styles.heroTop}>
          {!embedded ? (
            <Pressable onPress={() => router.back()} style={styles.heroIconBtn} hitSlop={8}>
              <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
            </Pressable>
          ) : <View style={styles.heroIconBtn} />}
          <View style={styles.heroBadge}>
            <Ionicons name={isSuper ? 'shield-checkmark' : 'checkmark-done-circle'} size={13} color="#F8FAFC" />
            <Text style={styles.heroBadgeText}>{isSuper ? 'SUPER ADMIN' : 'ADMIN'}</Text>
          </View>
          <Pressable onPress={() => { setRefreshing(true); load({ soft: true }); }} style={styles.heroIconBtn} hitSlop={8}>
            <Ionicons name="refresh-outline" size={20} color="#F8FAFC" />
          </Pressable>
        </View>
        <Text style={styles.heroTitle}>{sectionTitle}</Text>
        <Text style={styles.heroSubtitle}>{sectionSubtitle}</Text>
        {isSuper && !embedded ? (
          <Pressable onPress={() => router.push('/admin/advanced-tools')} style={styles.heroCta}>
            <Ionicons name="construct-outline" size={16} color="#0B1220" />
            <Text style={styles.heroCtaText}>Open system tools</Text>
          </Pressable>
        ) : null}
        {isSuper && embedded && section === 'overview' ? (
          <Pressable onPress={() => router.push('/(tabs)/admin-systems')} style={styles.heroCta}>
            <Ionicons name="construct-outline" size={16} color="#0B1220" />
            <Text style={styles.heroCtaText}>Open system tools</Text>
          </Pressable>
        ) : null}
      </LinearGradient>

      {!forcedSection ? (
        <View style={styles.navWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.navScroll}
            contentContainerStyle={styles.navRow}
          >
            {sections.map(([key, label]) => {
              const active = section === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => selectSection(key)}
                  style={[styles.navChip, { backgroundColor: active ? theme.colors.text : theme.colors.card, borderColor: active ? theme.colors.text : theme.colors.border }]}
                >
                  <Ionicons name={SECTION_ICONS[key] || 'ellipse-outline'} size={15} color={active ? theme.colors.background : theme.colors.textSecondary} />
                  <Text style={[styles.navChipText, { color: active ? theme.colors.background : theme.colors.text }]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        style={styles.bodyScroll}
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
            <Pressable onPress={() => setMessage('')} hitSlop={8}><Ionicons name="close" size={16} color={theme.colors.textSecondary} /></Pressable>
          </View>
        ) : null}

        {(section === 'overview' || (isSuper && section === 'analytics')) && !loading ? (
          <View style={styles.metricGrid}>
            {overviewMetrics.map(metric => (
              <View key={metric.label} style={[styles.metricCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={[styles.metricIcon, { backgroundColor: theme.colors.primary + '14' }]}>
                  <Ionicons name={metric.icon} size={16} color={theme.colors.primary} />
                </View>
                <Text style={[styles.metricValue, { color: theme.colors.text }]}>{metric.value ?? '—'}</Text>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{metric.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {section === 'overview' && !loading ? (
          <View style={styles.quickGrid}>
            {[
              ['users', 'Manage users', 'people-outline', 'Promote, suspend, and search accounts', '/(tabs)/admin-users'],
              ['verification', 'Verification queue', 'shield-checkmark-outline', 'Approve or reject pending requests', '/(tabs)/admin-review'],
              ['audit', 'Audit trail', 'list-outline', 'Inspect recent security events', '/(tabs)/admin-audit'],
              ['reports', 'Safety reports', 'flag-outline', 'Triage marketplace reports', '/admin/control-center?section=reports'],
            ].map(([key, title, icon, copy, tabHref]) => (
              <Pressable
                key={key}
                onPress={() => (embedded && tabHref ? router.push(tabHref) : selectSection(key))}
                style={[styles.quickCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <View style={[styles.quickIcon, { backgroundColor: '#0B122012' }]}>
                  <Ionicons name={icon} size={18} color="#0B1220" />
                </View>
                <Text style={[styles.quickTitle, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.quickCopy, { color: theme.colors.textSecondary }]}>{copy}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {section === 'users' ? (
          <View style={[styles.searchShell, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
            <TextInput
              value={userQuery}
              onChangeText={setUserQuery}
              placeholder="Search name, email, or role"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
            <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>{visibleData.length}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading {section}…</Text>
          </View>
        ) : null}

        {!loading && section !== 'overview' && section !== 'analytics' && visibleData.map((item, index) => (
          <ItemCard
            key={String(item._id || item.id || index)}
            item={item}
            section={section}
            theme={theme}
            role={role}
            busy={busyId === item._id}
            onReview={handleReview}
            onPromote={handlePromote}
            onToggleUser={handleToggleUser}
            onPropertyUpdate={handlePropertyUpdate}
          />
        ))}

        {!loading && section !== 'overview' && section !== 'analytics' && visibleData.length === 0 && !message ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All clear</Text>
            <Text style={[styles.emptyCopy, { color: theme.colors.textSecondary }]}>Nothing needs your attention in this queue right now.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ItemCard({ item, section, theme, role, busy, onReview, onPromote, onToggleUser, onPropertyUpdate }) {
  const title = item.name || item.title || item.action || item.type || 'Verification request';
  const meta = item.email
    || item.reason
    || item.notes
    || item.status
    || item.description
    || formatWhen(item.createdAt)
    || 'Review details and take action';
  const roleKey = item.role || item.canonicalRole;
  const suspended = isSuspended(item);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, opacity: busy ? 0.65 : 1 }]}>
      <View style={styles.cardHead}>
        <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '14' }]}>
          <Ionicons name={SECTION_ICONS[section] || 'document-text-outline'} size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]} numberOfLines={2}>{meta}</Text>
        </View>
        {section === 'users' ? (
          <View style={[styles.statusPill, { backgroundColor: suspended ? '#FEE2E2' : '#DCFCE7' }]}>
            <Text style={[styles.statusPillText, { color: suspended ? '#991B1B' : '#166534' }]}>{suspended ? 'Suspended' : 'Active'}</Text>
          </View>
        ) : null}
      </View>

      {section === 'users' ? (
        <Text style={[styles.roleLine, { color: theme.colors.primary }]}>{ROLE_LABELS[roleKey] || roleKey || 'User'}</Text>
      ) : null}

      {section === 'audit' && item.createdAt ? (
        <Text style={[styles.timeLine, { color: theme.colors.textMuted }]}>{formatWhen(item.createdAt)}</Text>
      ) : null}

      {section === 'verification' ? (
        <View style={styles.actionRow}>
          <ActionButton label="Approve" tone="success" onPress={() => onReview(item._id, 'approved')} />
          <ActionButton label="Reject" tone="danger" onPress={() => onReview(item._id, 'rejected')} />
        </View>
      ) : null}

      {section === 'listings' ? (
        <View style={styles.actionRow}>
          <ActionButton label="Publish" tone="success" onPress={() => onPropertyUpdate(item._id, { isPublished: true, verificationStatus: 'published' }, 'Listing published.')} />
          <ActionButton label="Hide" tone="danger" onPress={() => onPropertyUpdate(item._id, { isPublished: false, verificationStatus: 'rejected' }, 'Listing hidden.')} />
        </View>
      ) : null}

      {section === 'users' && roleKey !== 'super-admin' ? (
        <View style={styles.userActions}>
          <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>Change role</Text>
          <View style={styles.actionRow}>
            {roleKey !== 'agency-professional' ? <ActionButton label="Agency" tone="neutral" onPress={() => onPromote(item._id, 'agency-professional')} /> : null}
            {roleKey !== 'property-owner' ? <ActionButton label="Owner" tone="neutral" onPress={() => onPromote(item._id, 'property-owner')} /> : null}
            {role === 'super-admin' && roleKey !== 'admin' ? <ActionButton label="Admin" tone="warn" onPress={() => onPromote(item._id, 'admin')} /> : null}
            {roleKey !== 'buyer-tenant' && roleKey !== 'user' ? <ActionButton label="Buyer" tone="neutral" onPress={() => onPromote(item._id, 'buyer-tenant')} /> : null}
          </View>
          <ActionButton
            label={suspended ? 'Activate account' : 'Suspend account'}
            tone={suspended ? 'success' : 'danger'}
            full
            onPress={() => onToggleUser(item)}
          />
        </View>
      ) : null}

      {section === 'users' && roleKey === 'super-admin' ? (
        <Text style={[styles.protectedNote, { color: theme.colors.textSecondary }]}>Protected account — role and status cannot be changed here.</Text>
      ) : null}
    </View>
  );
}

function ActionButton({ label, onPress, tone = 'neutral', full = false }) {
  const palette = {
    success: { bg: '#DCFCE7', fg: '#166534' },
    danger: { bg: '#FEE2E2', fg: '#991B1B' },
    warn: { bg: '#FFEDD5', fg: '#9A3412' },
    neutral: { bg: '#F1F5F9', fg: '#0F172A' },
  }[tone];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionBtn, full && styles.actionBtnFull, { backgroundColor: palette.bg, opacity: pressed ? 0.75 : 1 }]}>
      <Text style={[styles.actionBtnText, { color: palette.fg }]}>{label}</Text>
    </Pressable>
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
  heroSubtitle: { color: '#CBD5E1', fontSize: 14, lineHeight: 21, maxWidth: 340 },
  heroCta: { alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E2E8F0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  heroCtaText: { color: '#0B1220', fontSize: 13, fontWeight: '800' },
  navWrap: { marginTop: -14, zIndex: 2 },
  navScroll: { flexGrow: 0 },
  navRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8, alignItems: 'center' },
  navChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  navChipText: { fontSize: 13, fontWeight: '700' },
  bodyScroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 12 },
  toastText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '47%', flexGrow: 1, minWidth: 140, borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  metricIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  metricLabel: { fontSize: 12, fontWeight: '700' },
  quickGrid: { gap: 10 },
  quickCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  quickIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  quickTitle: { fontSize: 16, fontWeight: '800' },
  quickCopy: { fontSize: 13, lineHeight: 19 },
  searchShell: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, minHeight: 48 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 10 },
  resultCount: { fontSize: 12, fontWeight: '800' },
  loadingBlock: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  loadingText: { fontSize: 13, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardMeta: { fontSize: 13, lineHeight: 18 },
  statusPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  roleLine: { fontSize: 12, fontWeight: '800' },
  timeLine: { fontSize: 12, fontWeight: '600' },
  userActions: { gap: 10 },
  actionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 11 },
  actionBtnFull: { alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '800' },
  protectedNote: { fontSize: 12, lineHeight: 17 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 56, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyCopy: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
