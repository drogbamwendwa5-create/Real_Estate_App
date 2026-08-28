import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.colors.background },
    backButton: { position: 'absolute', top: 20, left: 18, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
    logo: { width: 100, height: 100, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    tagline: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 32, textAlign: 'center' },
    button: { width: '100%', paddingVertical: 8, marginBottom: 16 },
    link: { color: theme.colors.primary, fontSize: 14 },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/auth/splash')}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
      </TouchableOpacity>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Real Estate</Text>
      <Text style={styles.tagline}>Find your perfect home with ease</Text>
      <Button mode="contained" style={styles.button} onPress={() => router.push('/auth/login')}>
        Get Started
      </Button>
      <Text style={styles.link} onPress={() => router.push('/auth/login')}>
        Already have an account? Sign In
      </Text>
    </ScrollView>
  );
}
