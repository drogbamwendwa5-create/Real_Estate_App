import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TextInput, ActivityIndicator } from 'react-native';
import { Button, List, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!id) return;
        const response = await fetch(`http://localhost:5000/api/messages/${id}`);
        const data = await response.json();
        setMessages(data.data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [id]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id, text: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, data]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.sender === 'me' ? styles.sentBubble : styles.receivedBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet</Text>
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <Button mode="contained" onPress={sendMessage} disabled={!input.trim()}>
          Send
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 12, marginBottom: 8 },
  sentBubble: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  receivedBubble: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  messageText: { fontSize: 16, color: '#1E293B' },
  messageTime: { fontSize: 11, color: '#64748B', marginTop: 4, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748B' },
});