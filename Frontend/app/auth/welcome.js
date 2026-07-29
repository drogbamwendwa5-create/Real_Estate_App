import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#64748B', marginBottom: 32, textAlign: 'center' },
  button: { width: '100%', paddingVertical: 8, marginBottom: 16 },
  link: { color: '#2563EB', fontSize: 14 },
});
