import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getConversations } from '../Services/api';
import { useAuth } from '../Hooks/useAuth';
import { useTheme } from '../Context/ThemeContext';

const MessagesScreen = ({ navigation }) => {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response?.data || response || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const other = (item.participants || []).find((p) => (p?._id || p?.id) !== user?.id) || item.participants?.[0] || {};
      const name = (other.name || 'Conversation').toLowerCase();
      const lastText = (item.lastMessage?.text || item.lastMessage?.content || '').toLowerCase();
      return !searchQuery || name.includes(searchQuery.toLowerCase()) || lastText.includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, user?.id]);

  const renderAIBanner = () => (
    <TouchableOpacity
      style={[
        styles.aiBanner,
        {
          backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
          borderColor: '#3B82F6',
        },
      ]}
      onPress={() => (router ? router.push('/chat/ai') : navigation?.navigate('AIChat'))}
      activeOpacity={0.9}
    >
      <View style={styles.aiIconWrap}>
        <Ionicons name="sparkles" size={20} color="#FFFFFF" />
      </View>
      <View style={styles.aiTextWrap}>
        <View style={styles.aiTitleRow}>
          <Text style={[styles.aiTitle, { color: theme.colors.text }]}>EstateAI Assistant</Text>
          <View style={styles.liveTag}>
            <View style={styles.liveTagDot} />
            <Text style={styles.liveTagText}>24/7 AI</Text>
          </View>
        </View>
        <Text style={[styles.aiSubtitle, { color: theme.colors.textSecondary }]}>
          Instant answers on mortgages, pricing & neighborhoods
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#2563EB" />
    </TouchableOpacity>
  );

  const renderConversation = ({ item }) => {
    const otherParticipant = (item.participants || []).find((p) => (p?._id || p?.id) !== user?.id) || item.participants?.[0] || {};
    const lastMessage = item.lastMessage;
    const name = otherParticipant?.name || 'User';
    const initial = (name[0] || 'U').toUpperCase();

    return (
      <TouchableOpacity
        style={[styles.conversationItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => {
          if (router) {
            router.push(`/chat/${item._id}`);
          } else {
            navigation.navigate('Chat', { conversationId: item._id, userId: otherParticipant?._id });
          }
        }}
        activeOpacity={0.88}
      >
        <View style={[styles.avatar, { backgroundColor: '#2563EB' }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {lastMessage?.createdAt ? new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
            </Text>
          </View>
          <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {lastMessage?.text || lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation?.canGoBack?.() ? navigation.goBack() : router?.replace('/(tabs)/home')}
          style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
        <TouchableOpacity
          onPress={() => (router ? router.push('/chat/ai') : navigation?.navigate('AIChat'))}
          style={[styles.aiHeaderBtn, { backgroundColor: '#2563EB' }]}
        >
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.aiHeaderBtnText}>AI</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.contentArea, { maxWidth: Math.min(width, 960), alignSelf: 'center', width: '100%' }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => (item._id || item.id).toString()}
          ListHeaderComponent={renderAIBanner}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={54} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>No conversations yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Inquire on any property listing or speak to our 24/7 AI Assistant.
              </Text>
            </View>
          }
          renderItem={renderConversation}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  aiHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  contentArea: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 10,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  aiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextWrap: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  aiSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
  },
  lastMessage: {
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default MessagesScreen;
