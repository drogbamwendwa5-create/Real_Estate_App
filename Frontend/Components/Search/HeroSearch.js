import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
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
  const priceRanges = ['Any', '0-20M', '20M-50M', '50M-100M', '100M+'];
  const bedroomOptions = ['Any', '1+', '2+', '3+', '4+', '5+'];

  const handleApply = () => {
    const params = {
      search: location || undefined,
      propertyType: propertyType !== 'all' ? propertyType.toLowerCase() : undefined,
      minPrice: priceRange.includes('M') ? priceRange.split('-')[0].replace('M', '000000') : undefined,
      maxPrice: priceRange.includes('M-') ? priceRange.split('-')[1].replace('M', '000000') : undefined,
      bedrooms: bedrooms !== 'any' ? bedrooms.replace('+', '') : undefined,
    };
    onSearch?.(params);
    onFilterChange?.(params);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
        <Icon name="search" size={20} color={theme.colors.primary} style={styles.searchIcon} />
        <TextInput
          mode="flat"
          placeholder="Search by location, estate, or keyword"
          value={location}
          onChangeText={setLocation}
          style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          right={<TextInput.Icon icon="filter" color={theme.colors.primary} onPress={() => setShowFilters(!showFilters)} />}
        />
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
                  label={`KES ${range}`}
                  active={priceRange === range}
                  onPress={() => setPriceRange(range)}
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
            onPress={handleApply}
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
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    boxShadow: '0px 4px 10px rgba(15, 23, 42, 0.06)',
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
