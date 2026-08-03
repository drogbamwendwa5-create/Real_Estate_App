import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTheme } from '../../Context/ThemeContext';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', type: 'category' },
  { id: 'apartment', label: 'Apartment', type: 'propertyType' },
  { id: 'house', label: 'House', type: 'propertyType' },
  { id: 'land', label: 'Land', type: 'propertyType' },
  { id: 'commercial', label: 'Commercial', type: 'propertyType' },
  { id: 'for-sale', label: 'For Sale', type: 'status' },
  { id: 'for-rent', label: 'For Rent', type: 'status' },
  { id: 'price-low', label: '< 5M', type: 'price' },
  { id: 'price-mid', label: '5M - 15M', type: 'price' },
  { id: 'price-high', label: '> 15M', type: 'price' },
];

/**
 * Horizontal filter chips below search bar
 */
export default function MapFilters({ filters = [], onFilterChange }) {
  const { theme } = useTheme();

  const toggleFilter = (filterId) => {
    if (onFilterChange) {
      if (filters.includes(filterId)) {
        onFilterChange(filters.filter(f => f !== filterId));
      } else {
        onFilterChange([...filters, filterId]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((option) => {
          const isSelected = filters.includes(option.id) || (option.id === 'all' && filters.length === 0);
          return (
            <Chip
              key={option.id}
              selected={isSelected}
              onPress={() => toggleFilter(option.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              textStyle={{
                color: isSelected ? theme.colors.surface : theme.colors.text,
              }}
              mode={isSelected ? 'flat' : 'outlined'}
            >
              {option.label}
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 9,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
