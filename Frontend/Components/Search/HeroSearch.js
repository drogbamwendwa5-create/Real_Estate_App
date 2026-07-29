import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';
import { FilterChip } from '../Search/FilterChip';

export const HeroSearch = ({ onSearch, onFilterChange, style }) => {
  const { theme } = useTheme();
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [bedrooms, setBedrooms] = useState('any');
  const [showFilters, setShowFilters] = useState(false);

  const propertyTypes = ['All', 'House', 'Apartment', 'Villa', 'Condo'];
  const priceRanges = ['Any', '$0-$200k', '$200k-$500k', '$500k-$1M', '$1M+'];
  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Icon name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
        <Text 
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search by location..."
        >
          {location || 'Find your dream home...'}
        </Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Icon 
            name="options" 
            size={20} 
            color={showFilters ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView 
          style={styles.filtersContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {propertyTypes.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={propertyType === type.toLowerCase()}
                  onPress={() => setPropertyType(type.toLowerCase())}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Price Range</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {priceRanges.map((range) => (
                <FilterChip
                  key={range}
                  label={range}
                  active={priceRange === range.toLowerCase()}
                  onPress={() => setPriceRange(range.toLowerCase())}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>Bedrooms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bedroomOptions.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  active={bedrooms === option.toLowerCase()}
                  onPress={() => setBedrooms(option.toLowerCase())}
                />
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              onSearch?.({ location, propertyType, priceRange, bedrooms });
              onFilterChange?.({ location, propertyType, priceRange, bedrooms });
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    marginTop: 16,
    maxHeight: 300,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HeroSearch;
