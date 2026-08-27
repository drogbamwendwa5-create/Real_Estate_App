import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { getMessages, sendMessage as sendMessageApi, markAsRead } from '../../Services/api';

const SAMPLE_CONVERSATIONS = {
  '1': [
    { _id: 'sample-1-1', sender: 'agent', text: 'Hello! Thanks for your interest in the Luxury Villa in Runda.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'sample-1-2', sender: 'agent', text: 'Is the property still available? I would love to schedule a viewing.', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  '2': [
    { _id: 'sample-2-1', sender: 'agent', text: 'Hello! I saw your inquiry regarding the Westlands Penthouse.', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: 'sample-2-2', sender: 'agent', text: 'Thanks for the information about the apartment.', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
};

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const myId = user?.id || user?._id;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !id) {
      setLoading(false);
      return;
    }
    if (id === 'ai') {
      router.replace('/chat/ai');
      return;
    }

    let active = true;
    const fetchMessages = async () => {
      try {
        const data = await getMessages(id);
        if (active) {
          const list = data?.data || data || [];
          if (Array.isArray(list) && list.length > 0) {
            setMessages(list);
          } else if (SAMPLE_CONVERSATIONS[id]) {
            setMessages(SAMPLE_CONVERSATIONS[id]);
          } else {
            setMessages([]);
          }
        }
        markAsRead(id).catch(() => {});
      } catch (error) {
        if (active) {
          setMessages(SAMPLE_CONVERSATIONS[id] || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMessages();
    return () => {
      active = false;
    };
  }, [id, isAuthenticated, router]);

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || !isAuthenticated || sending) return;

    setSending(true);
    setInput('');

    // Optimistic message update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: myId,
      text: text,
      content: text,
      createdAt: new Date().toISOString(),
      pending: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(String(id));
      const payload = isValidMongoId ? { conversationId: id, text } : { text, content: text };
      const res = await sendMessageApi(payload).catch(() => null);
      const savedMsg = res?.data || res;
      if (savedMsg?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? savedMsg : m))
        );
      }
    } catch {
      // Keep optimistic message displayed
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const senderId = item.sender?._id || item.sender?.id || item.sender;
    const isMine = senderId === myId || item.sender === 'user';
    const text = item.text || item.content || '';
    const time = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]}>
        <View
          style={[
            styles.bubble,
            isMine
              ? [styles.myBubble, { backgroundColor: '#2563EB' }]
              : [styles.theirBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
          ]}
        >
          <Text style={[styles.messageText, { color: isMine ? '#FFFFFF' : theme.colors.text }]}>
            {text}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isMine ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary },
              ]}
            >
              {time}
            </Text>
            {isMine && (
              <Ionicons
                name={item.pending ? 'time-outline' : 'checkmark-done'}
                size={13}
                color="rgba(255,255,255,0.8)"
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Login required</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Please log in to view and send messages.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#2563EB' }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.primaryBtnText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/chat/inbox'))}
          style={[styles.headerBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            Property Inquiry
          </Text>
          <View style={styles.onlineBadgeRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.headerStatus, { color: '#10B981' }]}>Active Conversation</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/chat/ai')}
          style={[styles.aiHeaderBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF' }]}
        >
          <Ionicons name="sparkles" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Main chat layout */}
      <KeyboardAvoidingView
        style={[styles.chatArea, { maxWidth: Math.min(width, 860), alignSelf: 'center', width: '100%' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading conversation...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Send your first message to connect with the agent.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBarWrapper, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Type your message..."
              placeholderTextColor={theme.colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={800}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: input.trim() && !sending ? '#2563EB' : 'rgba(37,99,235,0.3)' },
              ]}
              onPress={handleSendMessage}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  onlineBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  aiHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  myBubble: {
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  inputBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});