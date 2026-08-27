import React from 'react';
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity, View } from 'react-native';
import { List, Button, Title, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const faqs = [
  { q: 'How do I create a property listing?', a: 'Tap the "Create Listing" button from the home screen and fill in the property details.' },
  { q: 'How do I search for properties?', a: 'Use the search bar on the Search screen to find properties by keyword, location, or price range.' },
  { q: 'How do I save a property?', a: 'Tap the heart icon on any property listing to save it to your favourites.' },
  { q: 'How do I contact an agent?', a: 'Open a property listing and tap "Contact Agent" to send a message.' },
  { q: 'Is the app free to use?', a: 'Yes, our app is free for buyers and renters. Agents may have subscription plans.' },
];

export default function HelpScreen() {
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
      <Title style={styles.title}>Help & Support</Title>
      <Paragraph style={styles.subtitle}>Frequently Asked Questions</Paragraph>

      {faqs.map((faq, index) => (
        <List.Item
          key={index}
          title={faq.q}
          description={faq.a}
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          style={styles.faqItem}
        />
      ))}

      <Button mode="contained" style={styles.button} onPress={() => Linking.openURL('mailto:support@realestate.com')}>
        Contact Support
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  headerRow: { flexDirection: 'row', marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  faqItem: { backgroundColor: '#fff', marginBottom: 8 },
  button: { marginTop: 16 },
});
