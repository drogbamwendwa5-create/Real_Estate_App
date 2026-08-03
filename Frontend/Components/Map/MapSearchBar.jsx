import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';

/**
 * Search bar overlay on map
 */
export default function MapSearchBar({ onSearch, onSelectResult, onClear }) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (text) => {
    setIsSearching(true);
    try {
      // Photon API for Geocoding (based on OSM)
      const res = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`);
      setResults(res.data.features || []);
      if (onSearch) onSearch(text);
    } catch (error) {
      console.error('[MapSearchBar] Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.properties.name);
    setResults([]);
    if (onSelectResult) onSelectResult(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    if (onClear) onClear();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface + 'E6' }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search location..."
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          textColor={theme.colors.text}
          placeholderTextColor={theme.colors.textSecondary}
          theme={{ colors: { background: 'transparent' } }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.colors.surface }]}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.properties.osm_id?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.resultText, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.properties.name} {item.properties.city ? `, ${item.properties.city}` : ''} {item.properties.state ? `, ${item.properties.state}` : ''}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  clearIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  resultsContainer: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
