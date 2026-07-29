import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

export const SkeletonLoader = ({ width = '100%', height = 16, borderRadius = 8, style }) => {
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.skeleton, 
        { 
          width: width, 
          height, 
          borderRadius,
          backgroundColor: theme.colors.border,
        },
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

export default SkeletonLoader;
