import React from 'react';
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity, View } from 'react-native';
import { Card, Title, Paragraph, Button, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Title style={styles.appName}>Real Estate</Title>
          <Paragraph style={styles.version}>Version 1.0.0</Paragraph>
          <Paragraph style={styles.description}>
            Your trusted platform for buying, selling, and renting properties. Find your dream home with ease.
          </Paragraph>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Information</List.Subheader>
        <List.Item title="Privacy Policy" left={(props) => <List.Icon {...props} icon="shield" />} onPress={() => {}} />
        <List.Item title="Terms of Service" left={(props) => <List.Icon {...props} icon="file-document" />} onPress={() => {}} />
        <List.Item title="Open Source Licenses" left={(props) => <List.Icon {...props} icon="code" />} onPress={() => {}} />
      </List.Section>

      <Button mode="outlined" style={styles.button} onPress={() => Linking.openURL('https://realestate.com')}>
        Visit Website
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerRow: { flexDirection: 'row', marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  card: { marginBottom: 16 },
  cardContent: { alignItems: 'center', padding: 24 },
  appName: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  version: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  button: { marginTop: 16 },
});
