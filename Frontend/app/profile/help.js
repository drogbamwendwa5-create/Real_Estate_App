import React from 'react';
import { ScrollView, StyleSheet, Text, Linking } from 'react-native';
import { List, Button, Title, Paragraph } from 'react-native-paper';

const faqs = [
  { q: 'How do I create a property listing?', a: 'Tap the "Create Listing" button from the home screen and fill in the property details.' },
  { q: 'How do I search for properties?', a: 'Use the search bar on the Search screen to find properties by keyword, location, or price range.' },
  { q: 'How do I save a property?', a: 'Tap the heart icon on any property listing to save it to your favourites.' },
  { q: 'How do I contact an agent?', a: 'Open a property listing and tap "Contact Agent" to send a message.' },
  { q: 'Is the app free to use?', a: 'Yes, our app is free for buyers and renters. Agents may have subscription plans.' },
];

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  faqItem: { backgroundColor: '#fff', marginBottom: 8 },
  button: { marginTop: 16 },
});
