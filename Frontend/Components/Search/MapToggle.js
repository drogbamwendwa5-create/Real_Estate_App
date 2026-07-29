import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const MapToggle = ({ viewMode, onToggle }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: viewMode === 'list' ? theme.colors.primary : 'transparent' },
        ]}
        onPress={() => onToggle('list')}
      >
        <Icon 
          name="list" 
          size={18} 
          color={viewMode === 'list' ? '#FFFFFF' : theme.colors.text} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: viewMode === 'map' ? theme.colors.primary : 'transparent' },
        ]}
        onPress={() => onToggle('map')}
      >
        <Icon 
          name="map" 
          size={18} 
          color={viewMode === 'map' ? '#FFFFFF' : theme.colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapToggle;
