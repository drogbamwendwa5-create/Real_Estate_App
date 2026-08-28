import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import MarkdownText from './MarkdownText';

export default function LegalDocument({ content, title }) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={[styles.backCircle, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <MarkdownText content={content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  back: { marginRight: 12 },
  backCircle: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 40 },
});
