import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import PremiumSearchBar from '../Components/Search/PremiumSearchBar';
import PropertyCard from '../Components/cards/PropertyCard';
import FeaturedCarousel from '../Components/Home/FeaturedCarousel';
import CategoryHighlights from '../Components/Home/CategoryHighlights';

import { getAggregatedProperties, getFeaturedProperties } from '../Services/api';
import { useTheme } from '../Context/ThemeContext';

const { width, height } = Dimensions.get('window');

// ─── 8 frames + 1 loop frame: full day cycle ──────────────────────────────────
const FRAMES = [
  require('../assets/hero_frame5.jpg'), // 0 Pre-dawn
  require('../assets/hero_frame6.jpg'), // 1 Early morning
  require('../assets/hero_frame1.jpg'), // 2 Sunrise
  require('../assets/hero_frame2.jpg'), // 3 Midday
  require('../assets/hero_frame7.jpg'), // 4 Golden hour
  require('../assets/hero_frame3.jpg'), // 5 Dusk
  require('../assets/hero_frame8.jpg'), // 6 Blue hour
  require('../assets/hero_frame4.jpg'), // 7 Night
  require('../assets/hero_frame5.jpg'), // 8 Pre-dawn (seamless loop wrap)
];
const FRAME_LABELS = ['Pre-Dawn', 'Morning', 'Sunrise', 'Midday', 'Golden Hr', 'Dusk', 'Blue Hr', 'Night'];

// Each frame transition spans this many pixels of scroll
const FRAME_SCROLL = 350;
const CYCLE_LENGTH = 8 * FRAME_SCROLL; // 2800px total loop length
const OVERLAP = FRAME_SCROLL * 0.4;

// Build scroll-driven opacity for frame [i]
const buildFrameOpacity = (i, n, scrollY) => {
  const fadeInStart  = Math.max(0, i * FRAME_SCROLL - OVERLAP);
  const peakStart    = i * FRAME_SCROLL;
  const peakEnd      = i * FRAME_SCROLL + OVERLAP;
  const fadeOutEnd   = (i + 1) * FRAME_SCROLL;

  if (i === 0) {
    return scrollY.interpolate({
      inputRange: [0, peakEnd, fadeOutEnd],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
  }
  if (i === n - 1) {
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

// ─── Fixed full-screen background component ───────────────────────────────────
export const FullScreenBackground = ({ scrollY, autoPlay = false, duration = 30000 }) => {
  const kbScale = useRef(new Animated.Value(1)).current;
  const kbX     = useRef(new Animated.Value(0)).current;
  const kbY     = useRef(new Animated.Value(0)).current;

  // Modulo loop scroll position so frames loop infinitely
  // Home remains scroll-driven; auth screens can play the full sequence once.
  const timeline = useRef(new Animated.Value(0)).current;
  const loopScrollY = useRef(Animated.modulo(autoPlay ? timeline : scrollY, CYCLE_LENGTH)).current;

  useEffect(() => {
    if (!autoPlay) return undefined;
    const animation = Animated.timing(timeline, { toValue: CYCLE_LENGTH, duration, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [autoPlay, duration, timeline]);

  // Ken Burns loop
  useEffect(() => {
    const run = (flip = false) => {
      Animated.parallel([
        Animated.timing(kbScale, { toValue: flip ? 1 : 1.08, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbX,     { toValue: flip ? 0 : (Math.random() - 0.5) * 24, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbY,     { toValue: flip ? 0 : (Math.random() - 0.5) * 14, duration: 9000, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(!flip); });
    };
    run();
  }, []);

  const n = FRAMES.length;
  const frameOpacities = FRAMES.map((_, i) => buildFrameOpacity(i, n, loopScrollY));

  // Gradient darkens as night frames appear
  const overlayDark = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [0.45, 0.78],
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Ken Burns wrapper */}
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
            style={[StyleSheet.absoluteFill, styles.bgFrame, { opacity: frameOpacities[i] }]}
            resizeMode="cover"
          />
        ))}
      </Animated.View>

      {/* Gradient overlay */}
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

// ─── Fixed video HUD (scrubber + LIVE badge) ─────────────────────────────────
const VideoHUD = ({ scrollY }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  // Home remains scroll-driven; auth screens can play the full sequence once.
  const timeline = useRef(new Animated.Value(0)).current;
  const loopScrollY = useRef(Animated.modulo(autoPlay ? timeline : scrollY, CYCLE_LENGTH)).current;

  useEffect(() => {
    if (!autoPlay) return undefined;
    const animation = Animated.timing(timeline, { toValue: CYCLE_LENGTH, duration, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [autoPlay, duration, timeline]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const trackWidth = width - 36;

  const fillScaleX = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [0.0001, 1],
    extrapolate: 'clamp',
  });
  const fillTranslateX = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [-trackWidth / 2, 0],
    extrapolate: 'clamp',
  });
  const thumbTranslateX = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [0, trackWidth - 13],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.hudContainer} pointerEvents="none">
      {/* Frame labels */}
      <View style={styles.hudLabels}>
        {FRAME_LABELS.map((lbl, i) => (
          <Text key={i} style={styles.hudLabel}>{lbl}</Text>
        ))}
      </View>

      {/* Scrubber track */}
      <View style={styles.scrubTrack}>
        {FRAME_LABELS.map((_, i) => (
          <View
            key={i}
            style={[styles.scrubTick, { left: (i / (FRAME_LABELS.length - 1)) * trackWidth }]}
          />
        ))}
        <Animated.View
          style={[
            styles.scrubFill,
            {
              width: trackWidth,
              transform: [{ translateX: fillTranslateX }, { scaleX: fillScaleX }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.scrubThumb,
            {
              left: 0,
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </View>

      {/* LIVE badge */}
      <View style={styles.liveBadge}>
        <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
};

// ─── Main HomeScreen ──────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
  const numColumns = useMemo(() => {
    if (width >= 1280) return 4;
    if (width >= 900) return 3;
    return 2;
  }, [width]);

  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    try {
      setError(null);
      const response = await getAggregatedProperties({ limit: 60 });
      const list = response.data || response.properties || response || [];
      const arr = Array.isArray(list) ? list : [];
      setProperties(arr);
      setFilteredProperties(arr);
    } catch (err) {
      setError(err?.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const response = await getFeaturedProperties();
      const list = response.data || response.properties || response || [];
      setFeaturedProperties(Array.isArray(list) ? list : []);
    } catch (_) {}
    finally { setFeaturedLoading(false); }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(listFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  // ── Filtering ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = properties;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.estate?.toLowerCase().includes(q) ||
        p.town?.toLowerCase().includes(q) ||
        p.county?.toLowerCase().includes(q) ||
        p.address?.city?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(p =>
        p.propertyType?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    setFilteredProperties(filtered);
  }, [searchQuery, selectedCategory, properties]);

  // ── Scroll handler ───────────────────────────────────────────────────────────
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: e => setShowScrollTop(e.nativeEvent.contentOffset.y > 400),
    }
  );

  // ── Hero content (text over background) ─────────────────────────────────────
  const renderHeroContent = () => {
    const greeting = () => {
      const h = new Date().getHours();
      if (h < 5)  return 'Good Night';
      if (h < 12) return 'Good Morning';
      if (h < 17) return 'Good Afternoon';
      if (h < 20) return 'Good Evening';
      return 'Good Night';
    };

    return (
      <Animated.View
        style={[
          styles.heroContent,
          {
            opacity: contentAnim,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        {/* Verified pill */}
        <View style={styles.pill}>
          <Ionicons name="shield-checkmark" size={11} color="#10B981" />
          <Text style={styles.pillText}>Verified Listings</Text>
        </View>

        <Text style={styles.heroGreeting}>{greeting()}! 👋</Text>
        <Text style={styles.heroHeadline}>Find Your{'\n'}Dream Home</Text>
        <Text style={styles.heroSubtitle}>
          Scroll to watch the city come alive —{'\n'}from dawn to night.
        </Text>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { v: '2.4K+', l: 'Properties'   },
            { v: '120+',  l: 'Locations'     },
            { v: '98%',   l: 'Happy Clients' },
          ].map(({ v, l }, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statSep} />}
              <View style={styles.statCell}>
                <Text style={styles.statVal}>{v}</Text>
                <Text style={styles.statLbl}>{l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Scroll hint — fades after first scroll */}
        <Animated.View
          style={[
            styles.scrollHint,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Ionicons name="film-outline" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.scrollHintText}>Scroll to play time-lapse</Text>
          <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.5)" />
        </Animated.View>
      </Animated.View>
    );
  };

  // ── Section label ────────────────────────────────────────────────────────────
  const renderSectionHeader = () => (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>
          {searchQuery || selectedCategory ? 'Results' : 'All Properties'}
        </Text>
        <View style={styles.countBubble}>
          <Text style={styles.countText}>{filteredProperties.length}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.sortBtn}>
        <Ionicons name="options-outline" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.sortTxt}>Sort</Text>
      </TouchableOpacity>
    </View>
  );

  // ── List header ──────────────────────────────────────────────────────────────
  const renderListHeader = () => (
    <View>
      {/* Hero content (lives on top of the full-screen background) */}
      {renderHeroContent()}

      {/* Glass search bar */}
      <View style={styles.searchWrap}>
        <PremiumSearchBar
          onSearch={text => setSearchQuery(text)}
          placeholder="Search city, area, property…"
          theme={theme}
        />
      </View>

      {/* Featured carousel */}
      <FeaturedCarousel properties={featuredProperties} loading={featuredLoading} />

      {/* Categories */}
      <View style={styles.catWrap}>
        <CategoryHighlights
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      {renderSectionHeader()}
    </View>
  );

  const renderPropertyItem = useCallback(({ item }) => (
    <Animated.View style={{ opacity: listFadeAnim }}>
      <PropertyCard property={item} />
    </Animated.View>
  ), [listFadeAnim]);

  const keyExtractor = useCallback(item => item._id || item.id, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <FullScreenBackground scrollY={scrollY} />
        <VideoHUD scrollY={scrollY} />
        <SafeAreaView style={styles.safeLoading} edges={[]}>
          {renderHeroContent()}
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Finding properties…</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error && !properties.length) {
    return (
      <View style={styles.root}>
        <FullScreenBackground scrollY={scrollY} />
        <VideoHUD scrollY={scrollY} />
        <SafeAreaView style={styles.safeLoading} edges={[]}>
          {renderHeroContent()}
          <View style={styles.errorBox}>
            <View style={styles.errorIcon}>
              <Ionicons name="wifi-outline" size={32} color="#DC2626" />
            </View>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setLoading(true); fetchProperties(); }}
            >
              <LinearGradient
                colors={['#2563EB', '#7C3AED']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.retryGrad}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.retryTxt}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* ① Full-screen animated background (always behind everything) */}
      <FullScreenBackground scrollY={scrollY} />

      {/* ② Fixed video HUD at the very top */}
      <VideoHUD scrollY={scrollY} />

      {/* ③ Scrollable content */}
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <Animated.FlatList
          ref={flatListRef}
          data={filteredProperties}
          keyExtractor={keyExtractor}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.colWrap : null}
          contentContainerStyle={[styles.listContent, width >= 900 && { paddingHorizontal: 16 }]}
          ListHeaderComponent={renderListHeader}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProperties(); fetchFeatured(); }}
              tintColor="#fff"
              colors={['#2563EB']}
            />
          }
          renderItem={renderPropertyItem}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="home-outline" size={40} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyTitle}>No Properties Found</Text>
              <Text style={styles.emptySub}>
                {selectedCategory || searchQuery
                  ? 'Try adjusting your filters.'
                  : 'Properties will appear here once the database is populated.'}
              </Text>
              {(selectedCategory || searchQuery) && (
                <TouchableOpacity onPress={() => { setSelectedCategory(null); setSearchQuery(''); }}>
                  <Text style={styles.clearTxt}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </SafeAreaView>

      {/* ④ Scroll-to-top FAB */}
      {showScrollTop && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        >
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            style={styles.fabGrad}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050510',
  },
  safeArea: {
    flex: 1,
  },
  safeLoading: {
    flex: 1,
  },

  // ── Background frame ────────────────────────────────────────────────────────
  bgFrame: {
    width: '100%',
    height: '100%',
  },

  // ── Video HUD ───────────────────────────────────────────────────────────────
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 18,
    zIndex: 100,
  },
  hudLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  hudLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrubTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    overflow: 'visible',
    position: 'relative',
  },
  scrubTick: {
    position: 'absolute',
    top: -3,
    width: 1.5,
    height: 8.5,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  scrubFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  scrubThumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#fff',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
  },
  liveBadge: {
    position: 'absolute',
    top: 50,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // ── Hero content ────────────────────────────────────────────────────────────
  heroContent: {
    paddingTop: 110,        // push below the HUD scrubber
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderColor: 'rgba(16,185,129,0.42)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
    gap: 5,
    marginBottom: 4,
  },
  pillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroGreeting: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '500',
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 19,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statCell: { flex: 1, alignItems: 'center' },
  statVal:  { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLbl:  { color: 'rgba(255,255,255,0.48)', fontSize: 9, marginTop: 2, letterSpacing: 0.2 },
  statSep:  { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.12)' },

  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -2,
  },
  scrollHintText: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // ── Categories ──────────────────────────────────────────────────────────────
  catWrap: {
    marginBottom: 6,
  },

  // ── Section header ──────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 6,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  countBubble: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sortTxt: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 120,
  },
  colWrap: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },

  // ── Loading ─────────────────────────────────────────────────────────────────
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },

  // ── Error ───────────────────────────────────────────────────────────────────
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(220,38,38,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  errorSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  retryGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  retryTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Empty ───────────────────────────────────────────────────────────────────
  emptyBox: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  clearTxt: { color: '#2563EB', fontSize: 13, fontWeight: '600', marginTop: 4 },

  // ── FAB ─────────────────────────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.5)',
  },
  fabGrad: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
