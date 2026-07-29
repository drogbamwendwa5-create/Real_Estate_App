import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const Amenities = ({ amenities = [], style }) => {
  const { theme } = useTheme();

  if (!amenities || amenities.length === 0) {
    return null;
  }

  const amenityIcons = {
    'WiFi': 'wifi',
    'Parking': 'car',
    'Pool': 'water',
    'Gym': 'fitness',
    'Security': 'shield-checkmark',
    'Elevator': 'arrow-up',
    'Balcony': 'sunny',
    'Garden': 'leaf',
    'AC': 'snow',
    'Heating': 'thermometer',
  };

  const getIcon = (amenity) => {
    return amenityIcons[amenity] || 'checkmark-circle';
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {amenities.map((amenity, index) => (
        <View 
          key={index} 
          style={[styles.chip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Icon 
            name={getIcon(amenity)} 
            size={18} 
            color={theme.colors.primary} 
            style={styles.icon}
          />
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {amenity}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Amenities;
