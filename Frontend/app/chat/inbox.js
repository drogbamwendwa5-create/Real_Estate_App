import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { getConversations } from '../../Services/api';

export default function ChatInboxScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'unread'

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getConversations();
      setConversations(data?.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleNavigate = (route) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
    router.push(route);
  };

  const otherParticipantOf = (conv) =>
    (conv.participants || []).find((p) => (p?._id || p?.id) !== user?.id) || conv.participants?.[0] || {};

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const other = otherParticipantOf(item);
      const name = (other.name || 'Conversation').toLowerCase();
      const lastText = (item.lastMessage?.text || item.lastMessage?.content || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || lastText.includes(searchQuery.toLowerCase());

      if (filterTab === 'unread') {
        return matchesSearch && (item.unreadCount > 0);
      }
      return matchesSearch;
    });
  }, [conversations, searchQuery, filterTab, user?.id]);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderAIAssistantHero = () => (
    <TouchableOpacity
      style={[
        styles.aiBanner,
        {
          backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
          borderColor: '#3B82F6',
        },
      ]}
      onPress={() => handleNavigate('/chat/ai')}
      activeOpacity={0.9}
    >
      <View style={styles.aiBannerLeft}>
        <View style={styles.aiBannerIconWrap}>
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.aiBannerTextWrap}>
          <View style={styles.aiBannerTitleRow}>
            <Text style={[styles.aiBannerTitle, { color: theme.colors.text }]}>EstateAI Assistant</Text>
            <View style={styles.liveTag}>
              <View style={styles.liveTagDot} />
              <Text style={styles.liveTagText}>24/7 AI</Text>
            </View>
          </View>
          <Text style={[styles.aiBannerSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            Mortgage estimates, area advice & property answers
          </Text>
        </View>
      </View>
      <View style={styles.aiBannerAction}>
        <Text style={styles.aiBannerActionText}>Ask AI</Text>
        <Ionicons name="chevron-forward" size={15} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );

  const renderConversationItem = ({ item }) => {
    const other = otherParticipantOf(item);
    const name = other.name || 'Property Agent';
    const lastMsg = item.lastMessage?.text || item.lastMessage?.content || 'Started a conversation';
    const time = formatTimestamp(item.lastMessage?.createdAt || item.updatedAt);
    const unread = item.unreadCount || 0;
    const initial = (name[0] || 'U').toUpperCase();

    return (
      <TouchableOpacity
        style={[
          styles.convCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: unread > 0 ? '#3B82F6' : theme.colors.border,
          },
        ]}
        onPress={() => handleNavigate(`/chat/${item._id || item.id}`)}
        activeOpacity={0.88}
      >
        <View style={[styles.avatar, { backgroundColor: '#2563EB' }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.convDetails}>
          <View style={styles.convHeaderRow}>
            <Text style={[styles.convName, { color: theme.colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            {!!time && (
              <Text style={[styles.convTime, { color: unread > 0 ? '#2563EB' : theme.colors.textSecondary }]}>
                {time}
              </Text>
            )}
          </View>

          <View style={styles.convFooterRow}>
            <Text
              style={[
                styles.convPreview,
                { color: unread > 0 ? theme.colors.text : theme.colors.textSecondary, fontWeight: unread > 0 ? '600' : '400' },
              ]}
              numberOfLines={1}
            >
              {lastMsg}
            </Text>

            {unread > 0 && (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>{unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
            style={[styles.headerBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Messages</Text>
        </View>

        <TouchableOpacity
          onPress={() => handleNavigate('/chat/ai')}
          style={[styles.aiHeaderBtn, { backgroundColor: '#2563EB' }]}
        >
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.aiHeaderBtnText}>AI Assistant</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mainContent, { maxWidth: Math.min(width, 960), alignSelf: 'center', width: '100%' }]}>
        {/* Search & Tabs */}
        <View style={styles.controlsSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search conversations, agents..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {!!searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                filterTab === 'all'
                  ? [styles.tabBtnActive, { backgroundColor: '#2563EB' }]
                  : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
              ]}
              onPress={() => setFilterTab('all')}
            >
              <Text style={[styles.tabBtnText, { color: filterTab === 'all' ? '#FFFFFF' : theme.colors.text }]}>
                All ({conversations.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                filterTab === 'unread'
                  ? [styles.tabBtnActive, { backgroundColor: '#2563EB' }]
                  : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 },
              ]}
              onPress={() => setFilterTab('unread')}
            >
              <Text style={[styles.tabBtnText, { color: filterTab === 'unread' ? '#FFFFFF' : theme.colors.text }]}>
                Unread
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => (item._id || item.id).toString()}
            renderItem={renderConversationItem}
            ListHeaderComponent={renderAIAssistantHero}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <Ionicons name="chatbubbles-outline" size={42} color="#64748B" />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  {searchQuery ? 'No matching conversations' : 'No inquiries yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  {searchQuery
                    ? 'Try searching with a different name or keyword.'
                    : 'Start a conversation with an agent from property details or ask our 24/7 AI Assistant.'}
                </Text>

                <TouchableOpacity
                  style={[styles.emptyAIButton, { backgroundColor: '#2563EB' }]}
                  onPress={() => handleNavigate('/chat/ai')}
                >
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                  <Text style={styles.emptyAIButtonText}>Chat with AI Assistant</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  aiHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabBtnActive: {},
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTextWrap: {
    flex: 1,
  },
  aiBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  aiBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  aiBannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8,
  },
  aiBannerActionText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  convDetails: {
    flex: 1,
    gap: 4,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  convTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  convFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convPreview: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadPill: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  emptyAIButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  emptyAIButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
