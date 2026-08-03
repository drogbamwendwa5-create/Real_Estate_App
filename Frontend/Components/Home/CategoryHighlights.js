import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

const CATEGORIES = [
  {
    id: 'apartment',
    label: 'Apartment',
    icon: 'business',
    gradient: ['#2563EB', '#1D4ED8'],
  },
  {
    id: 'house',
    label: 'House',
    icon: 'home',
    gradient: ['#7C3AED', '#6D28D9'],
  },
  {
    id: 'land',
    label: 'Land',
    icon: 'map',
    gradient: ['#059669', '#047857'],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: 'storefront',
    gradient: ['#D97706', '#B45309'],
  },
  {
    id: 'villa',
    label: 'Villa',
    icon: 'flower',
    gradient: ['#DC2626', '#B91C1C'],
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: 'cube',
    gradient: ['#0891B2', '#0E7490'],
  },
];

const CategoryHighlights = ({ selectedCategory, onSelectCategory }) => {
  const { theme, isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 100,
      useNativeDriver: true,
    }).start();

    CATEGORIES.forEach((_, i) => {
      Animated.spring(itemAnims[i], {
        toValue: 1,
        tension: 80,
        friction: 8,
        delay: 80 * i,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionAccent} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Browse by Category
          </Text>
        </View>
        {selectedCategory && (
          <TouchableOpacity
            onPress={() => onSelectCategory(null)}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={14} color="#2563EB" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories list */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isActive = selectedCategory === item.id;
          return (
            <Animated.View
              style={{
                opacity: itemAnims[index],
                transform: [
                  {
                    translateY: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  onSelectCategory(isActive ? null : item.id)
                }
                activeOpacity={0.8}
                style={styles.categoryItem}
              >
                {/* Icon circle */}
                {isActive ? (
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.iconCircle}
                  >
                    <Ionicons name={item.icon} size={24} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(37,99,235,0.08)',
                        borderWidth: 1.5,
                        borderColor: isDarkMode
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(37,99,235,0.15)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={item.gradient[0]}
                    />
                  </View>
                )}

                {/* Label */}
                <Text
                  style={[
                    styles.categoryLabel,
                    {
                      color: isActive
                        ? item.gradient[0]
                        : theme.colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>

                {/* Active dot */}
                {isActive && (
                  <View
                    style={[
                      styles.activeDot,
                      { backgroundColor: item.gradient[0] },
                    ]}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#7C3AED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

export default CategoryHighlights;
