import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const ListPropertyFAB = ({ onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.fab, { backgroundColor: theme.colors.primary }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Icon name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.3)',
  },
});

export default ListPropertyFAB;
