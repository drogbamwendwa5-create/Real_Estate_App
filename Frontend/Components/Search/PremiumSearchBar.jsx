// src/Components/Search/PremiumSearchBar.jsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import useDebounce from '../../Hooks/useDebounce';

/**
 * PremiumSearchBar – a modern search input with glass‑morphism background,
 * debounced searches, and a simple suggestion dropdown.
 *
 * Props:
 *   onSearch         – called with the final search text (debounced)
 *   placeholder      – placeholder string for the input
 *   style            – additional container style overrides
 *   onLocationSelect – optional (for map screens) called when user taps a suggestion
 */
export default function PremiumSearchBar({
  onSearch,
  placeholder = 'Search...',
  style,
  onLocationSelect,
  ...rest
}) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [opacity] = useState(new Animated.Value(0));

  // Simple static suggestions – can be replaced with an API later
  const popular = ['Nairobi', 'Mombasa', 'Kigali', 'Nakuru', 'Eldoret'];
  const filtered = popular.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()) && query.length > 0,
  );

  useEffect(() => {
    if (debounced && onSearch) {
      onSearch(debounced);
    }
  }, [debounced, onSearch]);

  // Fade in/out the suggestion list
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: showSuggestions && filtered.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSuggestions, filtered.length, opacity]);

  const handleSelect = (item) => {
    setQuery(item);
    setShowSuggestions(false);
    if (onLocationSelect) onLocationSelect({ lat: 0, lng: 0 }); // placeholder – replace with real geocoding later
    if (onSearch) onSearch(item);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface + 'CC' }, style]} {...rest}>
      <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.icon} />
      <TextInput
        value={query}
        onChangeText={(t) => {
          setQuery(t);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={styles.input}
        underlineColorAndroid="transparent"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
          <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
      {filtered.length > 0 && (
        <Animated.View style={[styles.suggestionsBox, { opacity }]}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelect(item)}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 48,
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearBtn: {
    padding: 4,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 180,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});
