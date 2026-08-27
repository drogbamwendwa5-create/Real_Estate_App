/**
 * HeroBanner — 8-frame scroll-driven cinematic time-lapse effect.
 *
 * The 8 frames are ordered chronologically through a full day:
 *   0. Pre-dawn   (deep blue, city lights)
 *   1. Early morning (pastel pink/lavender mist)
 *   2. Sunrise    (warm orange-red)
 *   3. Midday     (vivid blue sky)
 *   4. Golden hour (warm amber late afternoon)
 *   5. Dusk       (purple-pink twilight)
 *   6. Blue hour  (electric blue, first stars)
 *   7. Night      (full city glow)
 *
 * Scrolling through BANNER_HEIGHT pixels plays through all 8 frames,
 * cross-dissolving between them with a 35% overlap — just like scrubbing
 * through a video timeline. The result looks like a real time-lapse
 * playing in the background as you scroll the feed.
 *
 * Extra effects:
 *  • Ken Burns — slow zoom + pan keeps it alive when not scrolling
 *  • Parallax   — image moves at 40% of scroll speed for depth
 *  • Scrubber HUD — timeline bar + day-part labels + pulsing LIVE badge
 *  • Content drifts upward as you scroll (depth cue)
 *  • "Scroll to watch" hint prompts the user to discover the effect
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Banner takes 68% of screen height — tall so the scroll range is
// comfortable and users can see multiple frame transitions
const BANNER_HEIGHT = height * 0.68;

// ─── 8 frames ordered through a full day ────────────────────────────────────
const FRAMES = [
  require('../../assets/hero_frame5.jpg'), // 0 — Pre-dawn
  require('../../assets/hero_frame6.jpg'), // 1 — Early morning
  require('../../assets/hero_frame1.jpg'), // 2 — Sunrise
  require('../../assets/hero_frame2.jpg'), // 3 — Midday
  require('../../assets/hero_frame7.jpg'), // 4 — Golden hour
  require('../../assets/hero_frame3.jpg'), // 5 — Dusk
  require('../../assets/hero_frame8.jpg'), // 6 — Blue hour
  require('../../assets/hero_frame4.jpg'), // 7 — Night
];

const FRAME_LABELS = [
  'Pre-Dawn', 'Morning', 'Sunrise', 'Midday',
  'Golden Hr', 'Dusk', 'Blue Hr', 'Night',
];

// Pixels of scroll each frame transition spans.
// Total video scroll range = (FRAMES.length - 1) * SEGMENT
const SEGMENT = BANNER_HEIGHT / (FRAMES.length - 1); // ~6 evenly-spaced frames
const OVERLAP  = SEGMENT * 0.4;                       // cross-fade region

// ─── Build opacity interpolation for frame [i] driven by scrollY ─────────────
const buildOpacity = (i, n, scrollY) => {
  const fadeInStart  = Math.max(0, i * SEGMENT - OVERLAP);
  const peakStart    = i * SEGMENT;
  const peakEnd      = i * SEGMENT + OVERLAP;
  const fadeOutEnd   = (i + 1) * SEGMENT;

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

// ─── Component ────────────────────────────────────────────────────────────────
const HeroBanner = ({ scrollY: externalScrollY, onSearchPress, userName }) => {
  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const scrollY = externalScrollY || fallbackScrollY;

  // Ken Burns
  const kbScale = useRef(new Animated.Value(1)).current;
  const kbX     = useRef(new Animated.Value(0)).current;
  const kbY     = useRef(new Animated.Value(0)).current;

  // Entrance
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide   = useRef(new Animated.Value(36)).current;

  // LIVE badge pulse
  const pulse = useRef(new Animated.Value(1)).current;

  // ── Ken Burns loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const run = (reverse = false) => {
      const tx = (Math.random() - 0.5) * 22;
      const ty = (Math.random() - 0.5) * 14;
      const ts = reverse ? 1 : 1.07 + Math.random() * 0.05;
      Animated.parallel([
        Animated.timing(kbScale, { toValue: ts, duration: 8000, useNativeDriver: true }),
        Animated.timing(kbX,     { toValue: tx, duration: 8000, useNativeDriver: true }),
        Animated.timing(kbY,     { toValue: ty, duration: 8000, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(!reverse); });
    };
    run();
  }, []);

  // ── Entrance ────────────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 1000, delay: 200, useNativeDriver: true }),
      Animated.spring(contentSlide,   { toValue: 0, tension: 50, friction: 9, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── LIVE badge pulse ────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Scroll-driven values ────────────────────────────────────────────────────

  // Parallax: image layer moves up at 40% of scroll speed
  const parallaxY = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT],
    outputRange: [0, -BANNER_HEIGHT * 0.42],
    extrapolate: 'clamp',
  });

  const maxScroll = (FRAMES.length - 1) * SEGMENT;
  const trackWidth = width - 36;

  const scrubFillScaleX = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0.0001, 1],
    extrapolate: 'clamp',
  });
  const scrubFillTranslateX = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [-trackWidth / 2, 0],
    extrapolate: 'clamp',
  });
  const scrubThumbTranslateX = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, trackWidth - 11],
    extrapolate: 'clamp',
  });

  // Whole banner fades away only after the full video has played
  const bannerFade = scrollY.interpolate({
    inputRange: [0, (FRAMES.length - 1) * SEGMENT, BANNER_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  // Content drifts upward as you scroll (parallax on text)
  const contentDrift = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT],
    outputRange: [0, -26],
    extrapolate: 'clamp',
  });

  // Per-frame opacities driven entirely by scrollY
  const n = FRAMES.length;
  const frameOpacities = FRAMES.map((_, i) => buildOpacity(i, n, scrollY));

  // Gradient overlay becomes slightly darker as night frames appear
  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, (FRAMES.length - 1) * SEGMENT],
    outputRange: [0.55, 0.82],
    extrapolate: 'clamp',
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'Good Night';
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    if (h < 20) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <Animated.View style={[styles.container, { opacity: bannerFade }]}>

      {/* ══════════════════════════════════════
          IMAGE LAYER — parallax + Ken Burns
          All 8 frames stacked, each driven by scrollY opacity
      ══════════════════════════════════════ */}
      <Animated.View
        style={[styles.imageLayer, { transform: [{ translateY: parallaxY }] }]}
      >
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
              style={[StyleSheet.absoluteFill, styles.frame, { opacity: frameOpacities[i] }]}
              resizeMode="cover"
            />
          ))}
        </Animated.View>
      </Animated.View>

      {/* ══════════════════════════════════════
          GRADIENT — deepens as night falls
      ══════════════════════════════════════ */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(3,3,18,0.05)', 'rgba(3,3,18,0.6)', 'rgba(3,3,18,1)']}
          locations={[0, 0.52, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ══════════════════════════════════════
          VIDEO HUD — scrubber + labels + LIVE
      ══════════════════════════════════════ */}
      <View style={styles.hud}>

        {/* Frame label row */}
        <View style={styles.labelRow}>
          {FRAME_LABELS.map((label, i) => (
            <Text key={i} style={styles.frameLabel}>{label}</Text>
          ))}
        </View>

        {/* Scrubber track */}
        <View style={styles.scrubberTrack}>
          {/* Tick marks at each frame position */}
          {FRAMES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                { left: (i / (FRAMES.length - 1)) * (width - 36) },
              ]}
            />
          ))}

          {/* Fill */}
          <Animated.View
            style={[
              styles.scrubberFill,
              {
                width: trackWidth,
                transform: [{ translateX: scrubFillTranslateX }, { scaleX: scrubFillScaleX }],
              },
            ]}
          />

          {/* Thumb */}
          <Animated.View
            style={[
              styles.scrubberThumb,
              {
                left: 0,
                transform: [{ translateX: scrubThumbTranslateX }],
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

      {/* ══════════════════════════════════════
          CONTENT — entrance fade + scroll drift
      ══════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: Animated.add(contentSlide, contentDrift) }],
          },
        ]}
      >
        {/* Verified pill */}
        <View style={styles.pill}>
          <Ionicons name="shield-checkmark" size={11} color="#10B981" />
          <Text style={styles.pillText}>Verified Listings</Text>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          {greeting()}{userName ? `, ${userName}` : ''}! 👋
        </Text>

        {/* Headline */}
        <Text style={styles.headline}>Find Your{'\n'}Dream Home</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Discover premium properties across{'\n'}thousands of stunning locations.
        </Text>

        {/* Stats strip */}
        <View style={styles.stats}>
          {[
            { value: '2.4K+', label: 'Properties'   },
            { value: '120+',  label: 'Locations'     },
            { value: '98%',   label: 'Happy Clients' },
          ].map(({ value, label }, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.cta}
          onPress={onSearchPress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2563EB', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaInner}
          >
            <Ionicons name="search" size={17} color="#fff" />
            <Text style={styles.ctaText}>Explore Properties</Text>
            <Ionicons name="arrow-forward" size={15} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Scroll hint */}
        <Animated.View
          style={[
            styles.scrollHint,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 60],
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
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width,
    height: BANNER_HEIGHT,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    boxShadow: '0px 8px 22px rgba(10, 10, 46, 0.45)',
  },

  // ── Image layer ─────────────────────────────────────────────────────────────
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
    height: BANNER_HEIGHT * 1.5,   // extra height for parallax headroom
    top: -BANNER_HEIGHT * 0.07,
  },
  frame: {
    width: '100%',
    height: '100%',
  },

  // ── HUD ─────────────────────────────────────────────────────────────────────
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,   // below status bar / notch
    paddingHorizontal: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  frameLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrubberTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    overflow: 'visible',
    position: 'relative',
  },
  tick: {
    position: 'absolute',
    top: -3,
    width: 1.5,
    height: 9,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scrubberFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#fff',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
  },
  liveBadge: {
    position: 'absolute',
    top: 52,
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

  // ── Content ─────────────────────────────────────────────────────────────────
  content: {
    position: 'absolute',
    bottom: 28,
    left: 22,
    right: 22,
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
  },
  pillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  greeting: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 46,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    lineHeight: 19,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 17, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 2, letterSpacing: 0.2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.14)' },
  cta: {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.5)',
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scrollHintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});

export default HeroBanner;
