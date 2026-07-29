import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const QuickStats = ({ bedrooms, bathrooms, area, parking, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, paddingVertical: theme.spacing?.md || 16 }, style]}>
      {bedrooms && (
        <View style={styles.statItem}>
          <Icon name="bed" size={22} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{bedrooms}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Beds</Text>
        </View>
      )}
      {bathrooms && (
        <View style={styles.statItem}>
          <Icon name="water" size={22} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{bathrooms}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Baths</Text>
        </View>
      )}
      {area && (
        <View style={styles.statItem}>
          <Icon name="resize" size={22} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{area}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>m²</Text>
        </View>
      )}
      {parking && (
        <View style={styles.statItem}>
          <Icon name="car" size={22} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{parking}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Parking</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default QuickStats;