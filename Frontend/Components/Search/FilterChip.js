import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

export const FilterChip = ({ label, active = false, onPress, icon }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: active ? '#FFFFFF' : theme.colors.textSecondary }]}>
            {icon}
          </Text>
        </View>
      )}
      <Text
        style={[
          styles.label,
          {
            color: active ? '#FFFFFF' : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterChip;
