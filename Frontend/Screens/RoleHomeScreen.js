import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '../Context/ThemeContext';
import PropertyCard from '../Components/Property/PropertyCard';
import {
  getAdminDashboard,
  getAggregatedProperties,
  getConversations,
  getMyProperties,
  getNotifications,
} from '../Services/api';

const ROLE_META = {
  'super-admin': {
    label: 'Super Admin',
    eyebrow: 'Command center',
    title: 'Run the platform with confidence.',
    subtitle: 'Review risk, people, listings, and system activity from one place.',
    accent: '#0B1220',
    soft: '#E2E8F0',
    icon: 'shield-checkmark',
  },
  admin: {
    label: 'Admin',
    eyebrow: 'Moderation desk',
    title: 'Keep the marketplace trustworthy.',
    subtitle: 'Resolve verification requests, reports, and listing issues quickly.',
    accent: '#DC2626',
    soft: '#FEE2E2',
    icon: 'checkmark-done-circle',
  },
  'agency-professional': {
    label: 'Agency / Professional',
    eyebrow: 'Your portfolio',
    title: 'Turn leads into viewings.',
    subtitle: 'Manage your listings, inquiries, and professional presence in fewer taps.',
    accent: '#0F766E',
    soft: '#CCFBF1',
    icon: 'business',
  },
  'property-owner': {
    label: 'Property Owner',
    eyebrow: 'Your properties',
    title: 'Stay in control of every listing.',
    subtitle: 'Publish accurate listings, verify ownership, and respond to buyers.',
    accent: '#2563EB',
    soft: '#DBEAFE',
    icon: 'home',
  },
  'buyer-tenant': {
    label: 'Buyer / Tenant',
    eyebrow: 'Your property search',
    title: 'Find a place that fits your life.',
    subtitle: 'Pick up where you left off with saved homes, searches, and viewings.',
    accent: '#059669',
    soft: '#D1FAE5',
    icon: 'search',
  },
  guest: {
    label: 'Guest',
    eyebrow: 'Explore the market',
    title: 'Find your next address.',
    subtitle: 'Browse verified homes and discover neighborhoods before you sign in.',
    accent: '#EA580C',
    soft: '#FFEDD5',
    icon: 'compass',
  },
};

const ROLE_ACTIONS = {
  'super-admin': [
    { label: 'Platform overview', icon: 'speedometer-outline', route: '/(tabs)/home', tone: 'dark' },
    { label: 'Manage users', icon: 'people-outline', route: '/(tabs)/admin-users', tone: 'light' },
    { label: 'Verification queue', icon: 'shield-outline', route: '/(tabs)/admin-review', tone: 'light' },
    { label: 'System tools', icon: 'construct-outline', route: '/(tabs)/admin-systems', tone: 'light' },
    { label: 'Add listings', icon: 'add-circle-outline', route: '/listing/create', tone: 'dark' },
  ],
  admin: [
    { label: 'Review queue', icon: 'checkmark-circle-outline', route: '/(tabs)/admin-review', tone: 'dark' },
    { label: 'Open reports', icon: 'flag-outline', route: '/(tabs)/admin-reports', tone: 'light' },
    { label: 'Manage listings', icon: 'home-outline', route: '/admin/control-center?section=listings', tone: 'light' },
    { label: 'Analytics', icon: 'bar-chart-outline', route: '/admin/control-center?section=analytics', tone: 'light' },
  ],
  'agency-professional': [
    { label: 'Portfolio', icon: 'business-outline', route: '/property/my-listings', tone: 'dark' },
    { label: 'Inquiries', icon: 'chatbubbles-outline', route: '/chat/inbox', tone: 'light' },
    { label: 'Profile & badge', icon: 'ribbon-outline', route: '/(tabs)/profile/edit', tone: 'light' },
    { label: 'Professional tools', icon: 'construct-outline', route: '/admin/advanced-tools', tone: 'light' },
  ],
  'property-owner': [
    { label: 'My listings', icon: 'home-outline', route: '/property/my-listings', tone: 'dark' },
    { label: 'Verify ownership', icon: 'document-text-outline', route: '/verification/ownership', tone: 'light' },
    { label: 'Inquiries', icon: 'chatbubble-ellipses-outline', route: '/chat/inbox', tone: 'light' },
  ],
  'buyer-tenant': [
    { label: 'Browse homes', icon: 'search-outline', route: '/(tabs)/search', tone: 'dark' },
    { label: 'Saved homes', icon: 'heart-outline', route: '/property/saved', tone: 'light' },
    { label: 'Viewings', icon: 'calendar-outline', route: '/property/schedule-viewing', tone: 'light' },
    { label: 'Messages', icon: 'chatbubble-ellipses-outline', route: '/chat/inbox', tone: 'light' },
  ],
  guest: [
    { label: 'Browse homes', icon: 'search-outline', route: '/(tabs)/search', tone: 'dark' },
    { label: 'Explore map', icon: 'map-outline', route: '/map', tone: 'light' },
    { label: 'Popular areas', icon: 'location-outline', route: '/(tabs)/explore', tone: 'light' },
    { label: 'Create account', icon: 'person-add-outline', route: '/auth/register', tone: 'light' },
  ],
};

const FALLBACK_MATCHES = [
  {
    _id: 'match-1',
    title: 'Luxury 5-Bed Villa',
    price: 85000000,
    currency: 'KES',
    location: 'Runda, Nairobi',
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    propertyType: 'villa',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'],
  },
  {
    _id: 'match-2',
    title: 'Modern Westlands Penthouse',
    price: 32000000,
    currency: 'KES',
    location: 'Westlands, Nairobi',
    bedrooms: 3,
    bathrooms: 3,
    area: 210,
    propertyType: 'apartment',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
  },
  {
    _id: 'match-3',
    title: 'Cozy Family Home',
    price: 35000000,
    currency: 'KES',
    location: 'Lavington, Nairobi',
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    propertyType: 'house',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
  },
  {
    _id: 'match-4',
    title: 'Serene Karen Sanctuary',
    price: 95000000,
    currency: 'KES',
    location: 'Karen, Nairobi',
    bedrooms: 5,
    bathrooms: 5,
    area: 520,
    propertyType: 'house',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
  },
  {
    _id: 'match-5',
    title: 'Executive Kilimani Residence',
    price: 19500000,
    currency: 'KES',
    location: 'Kilimani, Nairobi',
    bedrooms: 2,
    bathrooms: 2,
    area: 130,
    propertyType: 'apartment',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
  },
  {
    _id: 'match-6',
    title: 'Kitisuru Hillside Manor',
    price: 110000000,
    currency: 'KES',
    location: 'Kitisuru, Nairobi',
    bedrooms: 6,
    bathrooms: 6,
    area: 600,
    propertyType: 'villa',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'],
  },
];

const canonicalRole = role => ({
  user: 'buyer-tenant',
  agent: 'agency-professional',
}[role] || role || 'guest');

const firstName = user => (user?.name || 'there').trim().split(' ')[0];

function StatCard({ label, value, icon, accent, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: accent + '18' }]}>
        <Ionicons name={icon} size={17} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]} selectable>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ActionCard({ action, meta, theme, onPress, cardWidth }) {
  const dark = action.tone === 'dark';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        styles.actionCard,
        cardWidth ? { width: cardWidth } : null,
        {
          backgroundColor: dark ? meta.accent : theme.colors.card,
          borderColor: dark ? meta.accent : theme.colors.border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: dark ? '#FFFFFF22' : meta.soft }]}>
        <Ionicons name={action.icon} size={20} color={dark ? '#FFFFFF' : meta.accent} />
      </View>
      <Text style={[styles.actionLabel, { color: dark ? '#FFFFFF' : theme.colors.text }]}>{action.label}</Text>
      <Ionicons name="arrow-forward" size={16} color={dark ? '#FFFFFFAA' : theme.colors.textSecondary} />
    </Pressable>
  );
}

const FRAMES = [
  require('../assets/hero_frame5.jpg'),
  require('../assets/hero_frame6.jpg'),
  require('../assets/hero_frame1.jpg'),
  require('../assets/hero_frame2.jpg'),
  require('../assets/hero_frame7.jpg'),
  require('../assets/hero_frame3.jpg'),
  require('../assets/hero_frame8.jpg'),
  require('../assets/hero_frame4.jpg'),
];

const FRAME_SCROLL = 350;
const CYCLE_LENGTH = FRAMES.length * FRAME_SCROLL;
const OVERLAP = FRAME_SCROLL * 0.4;

const buildFrameOpacity = (i, scrollY) => {
  const fadeInStart = Math.max(0, i * FRAME_SCROLL - OVERLAP);
  const peakStart = i * FRAME_SCROLL;
  const peakEnd = i * FRAME_SCROLL + OVERLAP;
  const fadeOutEnd = (i + 1) * FRAME_SCROLL;
  if (i === 0) {
    return scrollY.interpolate({
      inputRange: [0, peakEnd, fadeOutEnd],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
  }
  if (i === FRAMES.length - 1) {
    return scrollY.interpolate({
      inputRange: [fadeInStart, peakStart],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }
  return scrollY.interpolate({
    inputRange: [fadeInStart, peakStart, peakEnd, fadeOutEnd],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
};

const FullScreenBackground = ({ scrollY, accent }) => {
  const kbScale = useRef(new Animated.Value(1)).current;
  const kbX = useRef(new Animated.Value(0)).current;
  const kbY = useRef(new Animated.Value(0)).current;
  const loopScrollY = useRef(Animated.modulo(scrollY, CYCLE_LENGTH)).current;

  useEffect(() => {
    const run = (flip = false) => {
      Animated.parallel([
        Animated.timing(kbScale, { toValue: flip ? 1 : 1.08, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbX, { toValue: flip ? 0 : (Math.random() - 0.5) * 24, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbY, { toValue: flip ? 0 : (Math.random() - 0.5) * 14, duration: 9000, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(!flip); });
    };
    run();
  }, []);

  const overlayDark = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [0.45, 0.78],
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: kbScale }, { translateX: kbX }, { translateY: kbY }] },
        ]}
      >
        {FRAMES.map((src, i) => (
          <Animated.Image
            key={i}
            source={src}
            style={[StyleSheet.absoluteFill, styles.bgFrame, { opacity: buildFrameOpacity(i, loopScrollY) }]}
            resizeMode="cover"
          />
        ))}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayDark }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(2,2,15,0.3)', 'rgba(2,2,15,0.55)', 'rgba(2,2,15,0.88)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export default function RoleHomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const user = useSelector(state => state.auth.user);
  const role = canonicalRole(user?.role || user?.canonicalRole);
  const meta = ROLE_META[role] || ROLE_META.guest;
  const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS.guest;
  const [stats, setStats] = useState({ primary: '—', secondary: '—', tertiary: '—' });
  const [matchesOfTheDay, setMatchesOfTheDay] = useState(FALLBACK_MATCHES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadDashboard = useCallback(async () => {
    setError('');
    try {
      if (role === 'super-admin' || role === 'admin') {
        const response = await getAdminDashboard();
        const statsData = response?.data?.data || {};
        setStats({
          primary: statsData.totalUsers ?? '—',
          secondary: statsData.totalProperties ?? '—',
          tertiary: statsData.totalSubscriptions ?? '—',
        });
        const propRes = await getAggregatedProperties({ limit: 6 }).catch(() => null);
        const props = propRes?.data || propRes?.properties || [];
        setMatchesOfTheDay(props.length >= 6 ? props.slice(0, 6) : [...props, ...FALLBACK_MATCHES].slice(0, 6));
      } else if (role === 'agency-professional' || role === 'property-owner') {
        const response = await getMyProperties();
        const listings = response?.data || [];
        setStats({
          primary: listings.length,
          secondary: listings.filter(item => item.isPublished).length,
          tertiary: listings.reduce((sum, item) => sum + (item.views || 0), 0),
        });
        const propRes = await getAggregatedProperties({ limit: 6 }).catch(() => null);
        const props = propRes?.data || propRes?.properties || [];
        setMatchesOfTheDay(props.length >= 6 ? props.slice(0, 6) : [...props, ...FALLBACK_MATCHES].slice(0, 6));
      } else {
        const response = await getAggregatedProperties({ limit: 12 });
        const listings = response?.data || response?.properties || [];
        setStats({ primary: listings.length || 6, secondary: '24/7', tertiary: 'Live' });
        setMatchesOfTheDay(listings.length >= 6 ? listings.slice(0, 6) : [...listings, ...FALLBACK_MATCHES].slice(0, 6));
      }
      if (role !== 'guest' && role !== 'super-admin' && role !== 'admin') {
        await Promise.allSettled([getConversations(), getNotifications()]);
      }
    } catch {
      setError('Some dashboard data is unavailable right now.');
      setMatchesOfTheDay(FALLBACK_MATCHES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const statItems = useMemo(() => {
    if (role === 'super-admin') return [
      ['Users', stats.primary, 'people-outline'],
      ['Listings', stats.secondary, 'home-outline'],
      ['Open reports', stats.tertiary, 'flag-outline'],
    ];
    if (role === 'admin') return [
      ['Users', stats.primary, 'people-outline'],
      ['Listings', stats.secondary, 'home-outline'],
      ['Needs review', stats.tertiary, 'alert-circle-outline'],
    ];
    if (role === 'agency-professional') return [
      ['Portfolio', stats.primary, 'business-outline'],
      ['Published', stats.secondary, 'checkmark-circle-outline'],
      ['Views', stats.tertiary, 'eye-outline'],
    ];
    if (role === 'property-owner') return [
      ['Properties', stats.primary, 'home-outline'],
      ['Published', stats.secondary, 'checkmark-circle-outline'],
      ['Views', stats.tertiary, 'eye-outline'],
    ];
    return [
      ['Matches today', stats.primary, 'sparkles-outline'],
      ['Saved searches', stats.secondary, 'bookmark-outline'],
      ['Verified', stats.tertiary, 'shield-checkmark-outline'],
    ];
  }, [role, stats]);

  const isBuyer = role === 'buyer-tenant' || role === 'guest';

  const actionCardWidth = useMemo(() => {
    if (width >= 1280) return '23.5%';
    if (width >= 768) return '31.8%';
    return '48.2%';
  }, [width]);

  const matchCardWidth = useMemo(() => {
    if (width >= 1280) return '31.8%';
    if (width >= 640) return '48.5%';
    return '100%';
  }, [width]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {isBuyer && <FullScreenBackground scrollY={scrollY} accent={meta.accent} />}
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor={meta.accent} />}
        contentContainerStyle={[styles.content, { paddingHorizontal: width < 390 ? 16 : 20 }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: meta.accent }]}>
              <Text style={styles.avatarText}>{firstName(user).slice(0, 1).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: meta.accent }]}>{meta.eyebrow}</Text>
              <Text style={[styles.greeting, { color: theme.colors.text }]} selectable>Hello, {firstName(user)}</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/profile/notifications')} style={[styles.bell, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="notifications-outline" size={21} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: meta.accent }]}>
          <View style={styles.heroIcon}><Ionicons name={meta.icon} size={22} color="#FFFFFF" /></View>
          <Text style={styles.heroTitle}>{meta.title}</Text>
          <Text style={styles.heroSubtitle}>{meta.subtitle}</Text>
          <View style={styles.rolePill}><Text style={styles.rolePillText}>{meta.label}</Text></View>
        </View>

        <View style={styles.statsRow}>
          {statItems.map(item => <StatCard key={item[0]} label={item[0]} value={loading ? '…' : item[1]} icon={item[2]} accent={meta.accent} theme={theme} />)}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick actions</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Everything important, one tap away</Text>
          </View>
          <Ionicons name="grid-outline" size={20} color={meta.accent} />
        </View>

        <View style={styles.actionGrid}>
          {actions.map(action => (
            <ActionCard key={action.label} action={action} meta={meta} theme={theme} cardWidth={actionCardWidth} onPress={() => router.push(action.route)} />
          ))}
        </View>

        {/* Matches of the Day Section (Exactly 6 properties) */}
        <View style={styles.matchesSection}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={18} color={meta.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Matches of the Day</Text>
                <View style={[styles.badgePill, { backgroundColor: meta.soft }]}>
                  <Text style={[styles.badgeText, { color: meta.accent }]}>6 Top Picks</Text>
                </View>
              </View>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Daily curated properties matched to current high-demand areas
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/search')}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, paddingVertical: 4 }]}
              accessibilityRole="button"
              accessibilityLabel="See all matches"
            >
              <Text style={[styles.seeAllText, { color: meta.accent }]}>See all →</Text>
            </Pressable>
          </View>

          <View style={styles.matchesGrid}>
            {matchesOfTheDay.slice(0, 6).map((property, index) => (
              <View
                key={property._id || property.id || `match-${index}`}
                style={[
                  styles.matchCardWrapper,
                  { width: matchCardWidth }
                ]}
              >
                <PropertyCard
                  property={property}
                  index={index}
                  onPress={() => router.push(`/property/${property._id || property.id}`)}
                  compact={width >= 640}
                />
              </View>
            ))}
          </View>
        </View>

        {error ? (
          <Pressable onPress={loadDashboard} style={[styles.notice, { backgroundColor: meta.soft }]}>
            <Ionicons name="refresh-outline" size={18} color={meta.accent} />
            <Text style={[styles.noticeText, { color: theme.colors.text }]}>{error} Tap to retry.</Text>
          </Pressable>
        ) : null}

        <View style={[styles.nextCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.nextIcon, { backgroundColor: meta.soft }]}>
            <Ionicons name={role === 'buyer-tenant' || role === 'guest' ? 'sparkles-outline' : 'arrow-forward-circle-outline'} size={22} color={meta.accent} />
          </View>
          <View style={styles.nextCopy}>
            <Text style={[styles.nextTitle, { color: theme.colors.text }]}>
              {role === 'buyer-tenant' || role === 'guest' ? 'Your next best move' : 'Keep momentum'}
            </Text>
            <Text style={[styles.nextText, { color: theme.colors.textSecondary }]}>
              {role === 'buyer-tenant' || role === 'guest'
                ? 'Start with a search and save the homes you want to revisit.'
                : 'Complete the next task in your action grid to keep your account moving.'}
            </Text>
          </View>
        </View>

        <Text style={[styles.footerHint, { color: theme.colors.textSecondary }]}>Your dashboard adapts to your permissions.</Text>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingTop: 18, paddingBottom: 120, gap: 18 },
  bgFrame: { width: '100%', height: '100%' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  eyebrow: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  greeting: { fontSize: 21, fontWeight: '800', marginTop: 2 },
  bell: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 24, padding: 22, gap: 9, borderCurve: 'continuous' },
  heroIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF26', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#FFFFFF', fontSize: 27, lineHeight: 32, fontWeight: '800', maxWidth: 330 },
  heroSubtitle: { color: '#FFFFFFCC', fontSize: 14, lineHeight: 20, maxWidth: 350 },
  rolePill: { alignSelf: 'flex-start', borderRadius: 20, backgroundColor: '#FFFFFF22', paddingHorizontal: 12, paddingVertical: 6, marginTop: 2 },
  rolePillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 112, borderRadius: 18, borderWidth: 1, padding: 12, gap: 5, borderCurve: 'continuous' },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 21, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  sectionSubtitle: { fontSize: 13, marginTop: 3 },
  seeAllText: { fontSize: 13, fontWeight: '700' },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '48%', minHeight: 126, borderRadius: 18, borderWidth: 1, padding: 15, justifyContent: 'space-between', borderCurve: 'continuous' },
  actionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '800', lineHeight: 19, maxWidth: 120 },
  matchesSection: { gap: 12, marginTop: 6 },
  matchesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  matchCardWrapper: { width: '100%' },
  notice: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  nextCard: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 12, borderCurve: 'continuous' },
  nextIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextCopy: { flex: 1, gap: 4 },
  nextTitle: { fontSize: 16, fontWeight: '800' },
  nextText: { fontSize: 13, lineHeight: 19 },
  footerHint: { textAlign: 'center', fontSize: 12, marginTop: 2 },
});