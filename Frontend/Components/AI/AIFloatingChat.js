import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import {
  sendAIMessage,
  getStoredAIHistory,
  storeAIHistory,
  AI_QUICK_PROMPTS,
} from '../../Services/aiService';

const INITIAL_GREETING = {
  id: 'mini-welcome',
  role: 'assistant',
  content: `👋 **Hi there!** I am your **EstateAI Assistant**.\n\nAsk me about property prices, mortgages, areas like Kilimani & Westlands, or buying steps!`,
  createdAt: new Date().toISOString(),
};

export default function AIFloatingChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, isDarkMode } = useTheme();
  const { width, height } = useWindowDimensions();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Pulse animation for the floating button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    (async () => {
      const saved = await getStoredAIHistory();
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      }
    })();
  }, []);

  const toggleModal = () => {
    if (!isOpen) {
      setIsOpen(true);
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 70, friction: 9 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setIsOpen(false);
      });
    }
  };

  const handleSend = async (customText) => {
    const text = (customText || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const result = await sendAIMessage(newHistory);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        model: result.model,
        createdAt: new Date().toISOString(),
      };
      const updated = [...newHistory, aiMsg];
      setMessages(updated);
      await storeAIHistory(updated);
    } catch (e) {
      const err = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Temporary network error. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, err]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const openFullscreen = () => {
    toggleModal();
    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.activeElement?.blur) {
      document.activeElement.blur();
    }
    router.push('/chat/ai');
  };

  // Hide the floating button on the dedicated full-screen AI chat page
  if (pathname === '/chat/ai') {
    return null;
  }

  const isSmallScreen = width < 600;

  return (
    <>
      {/* Floating Action Button at Bottom-Right */}
      <View style={styles.floatingWrapper} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: '#2563EB' }]}
          onPress={toggleModal}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open AI Assistant"
        >
          <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>AI</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Mini Chat Modal / Window */}
      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          animationType="fade"
          onRequestClose={toggleModal}
        >
          <View style={[styles.modalOverlay, isSmallScreen ? styles.modalOverlayMobile : styles.modalOverlayDesktop]}>
            <TouchableOpacity style={styles.backdrop} onPress={toggleModal} activeOpacity={1} />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.miniChatWindow,
                isSmallScreen
                  ? { width: '100%', height: Math.min(height * 0.75, 540) }
                  : { width: 390, height: 530, position: 'absolute', bottom: 95, right: 20 },
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Mini Header */}
              <View style={[styles.miniHeader, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.miniHeaderLeft}>
                  <View style={styles.miniAvatar}>
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </View>
                  <View>
                    <View style={styles.titleRow}>
                      <Text style={[styles.miniTitle, { color: theme.colors.text }]}>EstateAI Mini</Text>
                      <View style={styles.onlineDot} />
                    </View>
                    <Text style={[styles.miniSubtitle, { color: theme.colors.textSecondary }]}>
                      24/7 Real Estate Advisor
                    </Text>
                  </View>
                </View>

                <View style={styles.miniHeaderActions}>
                  <TouchableOpacity
                    onPress={openFullscreen}
                    style={[styles.headerIconBtn, { backgroundColor: theme.colors.surface }]}
                    title="Open Fullscreen"
                  >
                    <Ionicons name="expand-outline" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={toggleModal}
                    style={[styles.headerIconBtn, { backgroundColor: theme.colors.surface }]}
                    title="Close"
                  >
                    <Ionicons name="close" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick Prompts */}
              <View style={styles.quickPrompts}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={AI_QUICK_PROMPTS.slice(0, 4)}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.promptsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.promptChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: theme.colors.border }]}
                      onPress={() => handleSend(item.prompt)}
                      disabled={loading}
                    >
                      <Text style={[styles.promptChipText, { color: theme.colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Messages list */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isUser = item.role === 'user';
                  return (
                    <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
                      <View
                        style={[
                          styles.msgBubble,
                          isUser
                            ? [styles.userBubble, { backgroundColor: '#2563EB' }]
                            : [styles.aiBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
                        ]}
                      >
                        <Text style={[styles.msgContent, { color: isUser ? '#FFFFFF' : theme.colors.text }]}>
                          {item.content}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                ListFooterComponent={
                  loading ? (
                    <View style={styles.miniLoadingRow}>
                      <ActivityIndicator size="small" color="#2563EB" />
                      <Text style={[styles.miniLoadingText, { color: theme.colors.textSecondary }]}>Thinking...</Text>
                    </View>
                  ) : null
                }
              />

              {/* Mini Input */}
              <View style={[styles.miniInputBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <View style={[styles.miniInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <TextInput
                    style={[styles.miniInput, { color: theme.colors.text }]}
                    placeholder="Ask about properties, mortgages..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={() => handleSend()}
                  />
                  <TouchableOpacity
                    style={[styles.miniSendBtn, { backgroundColor: input.trim() && !loading ? '#2563EB' : 'rgba(37,99,235,0.3)' }]}
                    onPress={() => handleSend()}
                    disabled={!input.trim() || loading}
                  >
                    <Ionicons name="send" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 85,
    right: 18,
    zIndex: 9999,
  },
  floatingBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 10px rgba(37, 99, 235, 0.38)',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(37,99,235,0.25)',
  },
  badgePill: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
  },
  modalOverlayDesktop: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalOverlayMobile: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  miniChatWindow: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    boxShadow: '0px 8px 18px rgba(0, 0, 0, 0.28)',
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  miniHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  miniSubtitle: {
    fontSize: 10,
  },
  miniHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPrompts: {
    paddingVertical: 6,
  },
  promptsList: {
    paddingHorizontal: 12,
    gap: 6,
  },
  promptChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  msgRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  msgContent: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  miniLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  miniLoadingText: {
    fontSize: 11,
  },
  miniInputBar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  miniInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    height: 38,
  },
  miniInput: {
    flex: 1,
    fontSize: 12,
  },
  miniSendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
