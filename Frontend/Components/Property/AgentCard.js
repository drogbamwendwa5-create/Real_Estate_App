import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const AgentCard = ({ agent, onPress, style }) => {
  const { theme } = useTheme();

  if (!agent) return null;

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: agent.avatar || agent.image || 'https://via.placeholder.com/60' }} 
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
          {agent.name || 'Agent Name'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {agent.title || 'Real Estate Agent'}
        </Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color={theme.colors.warning} />
          <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
            {agent.rating?.toFixed(1) || '5.0'}
          </Text>
          <Text style={[styles.reviews, { color: theme.colors.textSecondary }]}>
            ({agent.reviewCount || 0})
          </Text>
        </View>
      </View>
      <View style={[styles.callButton, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name="call" size={18} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 13,
    marginLeft: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AgentCard;
