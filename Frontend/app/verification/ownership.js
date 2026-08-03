import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';

export default function OwnershipVerification() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Verify ownership', headerShown: false }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="shield-checkmark-outline" size={34} color="#fff" />
          <Text style={styles.heroTitle}>Build buyer confidence.</Text>
          <Text style={styles.heroText}>Ownership documents are encrypted and only available to authorized reviewers.</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="document-lock-outline" size={28} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Choose a listing to verify</Text>
          <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>Open your listings, select one, and submit its title deed, lease agreement, or authorized management document for review.</Text>
          <Pressable onPress={() => router.push('/property/my-listings')} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.buttonText}>Open my listings</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </Pressable>
        </View>
        <View style={[styles.info, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="information-circle-outline" size={19} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Accepted file types and maximum sizes are enforced by the secure upload service.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 14, paddingBottom: 60, gap: 16 },
  hero: { borderRadius: 24, padding: 22, gap: 9 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
  heroText: { color: '#FFFFFFCC', fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  copy: { fontSize: 14, lineHeight: 21 },
  button: { borderRadius: 14, padding: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  info: { borderRadius: 14, padding: 13, flexDirection: 'row', gap: 8 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});