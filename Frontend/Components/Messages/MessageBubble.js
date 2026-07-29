import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../Context/ThemeContext';

export const MessageBubble = ({ message, onPress, style }) => {
  const { theme } = useTheme();

  if (!message) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: message.avatar || message.senderAvatar || 'https://via.placeholder.com/48' }} 
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.sender, { color: theme.colors.text }]} numberOfLines={1}>
            {message.sender || message.name || 'Agent'}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatTime(message.timestamp || message.createdAt)}
          </Text>
        </View>
        
        <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {message.text || message.body || message.message || 'New message'}
        </Text>
        
        {message.property && (
          <View style={[styles.propertyPreview, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Image 
              source={{ uri: message.property.image || message.property.images?.[0] || 'https://via.placeholder.com/60' }} 
              style={styles.propertyImage}
              resizeMode="cover"
            />
            <View style={styles.propertyInfo}>
              <Text style={[styles.propertyTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {message.property.title || message.property.address}
              </Text>
              <Text style={[styles.propertyPrice, { color: theme.colors.primary }]} numberOfLines={1}>
                ${message.property.price?.toLocaleString()}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </View>
        )}
        
        {message.unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.badgeText}>{message.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  propertyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  propertyImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  propertyPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MessageBubble;
