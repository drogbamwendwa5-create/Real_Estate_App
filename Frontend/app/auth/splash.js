import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/welcome');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.appName}>Real Estate</Text>
      <Text style={styles.tagline}>Find your dream property</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2563EB' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#fff' },
});
