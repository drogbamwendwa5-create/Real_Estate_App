import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import {
  sendAIMessage,
  getStoredAIHistory,
  storeAIHistory,
  clearStoredAIHistory,
  AI_QUICK_PROMPTS,
} from '../../Services/aiService';

const INITIAL_GREETING = {
  id: 'welcome-1',
  role: 'assistant',
  content: `👋 **Welcome to EstateAI Assistant!**\n\nI am your 24/7 AI Real Estate advisor powered by OpenRouter free intelligence. How can I assist you today?\n\n• **Search & Neighborhood Guide**\n• **Mortgage & Yield Calculations**\n• **Legal Buying & Ownership Process**`,
  createdAt: new Date().toISOString(),
};

export default function AIChatScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState('minimax/minimax-m3:free');
  const flatListRef = useRef(null);

  // Pulse animation for the active AI badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Load persisted chat history
    (async () => {
      const saved = await getStoredAIHistory();
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      }
    })();
  }, []);

  const handleSendMessage = async (customPrompt) => {
    const text = (customPrompt || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const result = await sendAIMessage(newMessages);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        model: result.model,
        fallback: result.fallback,
        createdAt: new Date().toISOString(),
      };

      if (result.model && !result.fallback) {
        setActiveModel(result.model);
      }

      const updatedHistory = [...newMessages, aiMsg];
      setMessages(updatedHistory);
      await storeAIHistory(updatedHistory);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ I encountered a temporary connection issue. Please check your network or try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const handleClearChat = async () => {
    await clearStoredAIHistory();
    setMessages([INITIAL_GREETING]);
  };

  const handleShareMessage = async (content) => {
    try {
      await Share.share({ message: content });
    } catch (e) {}
  };

  // Basic formatted text renderer for bold / bullet highlights
  const renderFormattedText = (rawText, isUser) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <View style={styles.textBlock}>
        {lines.map((line, idx) => {
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const cleanLine = isBullet ? line.trim().replace(/^[-•]\s*/, '') : line;

          return (
            <View key={idx} style={[styles.lineRow, isBullet && styles.bulletRow]}>
              {isBullet && (
                <Text style={[styles.bulletDot, { color: isUser ? '#FFFFFF' : theme.colors.primary }]}>
                  •
                </Text>
              )}
              <Text
                style={[
                  styles.msgText,
                  { color: isUser ? '#FFFFFF' : theme.colors.text },
                  isBullet && { flex: 1 },
                ]}
              >
                {cleanLine.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
                  if (chunk.startsWith('**') && chunk.endsWith('**')) {
                    return (
                      <Text
                        key={cIdx}
                        style={{
                          fontWeight: '800',
                          color: isUser ? '#FFFFFF' : isDarkMode ? '#60A5FA' : '#1D4ED8',
                        }}
                      >
                        {chunk.slice(2, -2)}
                      </Text>
                    );
                  }
                  return chunk;
                })}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userMessageRow : styles.aiMessageRow,
        ]}
      >
        {!isUser && (
          <View style={[styles.aiAvatar, { backgroundColor: '#2563EB' }]}>
            <Ionicons name="sparkles" size={15} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: '#2563EB' }]
              : [
                  styles.aiBubble,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ],
          ]}
        >
          {renderFormattedText(item.content, isUser)}

          <View style={styles.bubbleFooter}>
            <Text
              style={[
                styles.timestamp,
                { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary },
              ]}
            >
              {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>

            {!isUser && (
              <TouchableOpacity
                onPress={() => handleShareMessage(item.content)}
                style={styles.shareBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="share-outline" size={13} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          style={[styles.headerBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>EstateAI Assistant</Text>
            <View style={styles.liveIndicator}>
              <Animated.View
                style={[
                  styles.liveDot,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            OpenRouter Free AI • 24/7 Advisor
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClearChat}
          style={[styles.headerBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Clear chat"
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error || '#EF4444'} />
        </TouchableOpacity>
      </View>

      {/* Main Chat Container */}
      <KeyboardAvoidingView
        style={[styles.chatContainer, { maxWidth: Math.min(width, 860), alignSelf: 'center', width: '100%' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={AI_QUICK_PROMPTS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.suggestionsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => handleSendMessage(item.prompt)}
                disabled={loading}
              >
                <Ionicons name="bulb-outline" size={13} color="#2563EB" />
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingRow}>
                <View style={[styles.aiAvatar, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                </View>
                <View style={[styles.loadingBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    EstateAI is thinking...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBarWrapper, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Ask anything about properties, mortgages, areas..."
              placeholderTextColor={theme.colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={800}
              onSubmitEditing={() => handleSendMessage()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() && !loading ? '#2563EB' : 'rgba(37,99,235,0.3)' },
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
            >
              {loading ? (
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
  headerTitleBlock: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  liveIndicator: {
    padding: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  chatContainer: {
    flex: 1,
  },
  suggestionsContainer: {
    paddingVertical: 10,
  },
  suggestionsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  textBlock: {
    gap: 4,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletRow: {
    paddingLeft: 4,
    gap: 6,
  },
  bulletDot: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timestamp: {
    fontSize: 10,
  },
  shareBtn: {
    padding: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
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
});
