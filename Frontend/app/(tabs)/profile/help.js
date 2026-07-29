import React from 'react';
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { Button, Surface, Text as PaperText, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const faqs = [
  { q: 'How do I create a property listing?', a: 'Tap the "Create Listing" button from the home screen and fill in the property details.' },
  { q: 'How do I search for properties?', a: 'Use the search bar on the Search screen to find properties by keyword, location, or price range.' },
  { q: 'How do I save a property?', a: 'Tap the heart icon on any property listing to save it to your favourites.' },
  { q: 'How do I contact an agent?', a: 'Open a property listing and tap "Contact Agent" to send a message.' },
  { q: 'Is the app free to use?', a: 'Yes, our app is free for buyers and renters. Agents may have subscription plans.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <PaperText style={[styles.title, { color: theme.colors.text }]}>Help & Support</PaperText>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          FREQUENTLY ASKED QUESTIONS
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {faqs.map((faq, index) => (
            <React.Fragment key={index}>
              <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <View style={[styles.faqIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Icon name="help-circle" size={20} color={theme.colors.primary} />
                  </View>
                  <PaperText style={[styles.faqQuestion, { color: theme.colors.text }]}>
                    {faq.q}
                  </PaperText>
                </View>
                <PaperText style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
                  {faq.a}
                </PaperText>
              </View>
              {index < faqs.length - 1 && <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />}
            </React.Fragment>
          ))}
        </Surface>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          CONTACT US
        </PaperText>
        <Surface style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.contactItem}>
            <View style={[styles.contactIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="mail" size={22} color={theme.colors.success} />
            </View>
            <View style={styles.contactInfo}>
              <PaperText style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                Email
              </PaperText>
              <PaperText style={[styles.contactValue, { color: theme.colors.text }]}>
                support@realestate.com
              </PaperText>
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.contactItem}>
            <View style={[styles.contactIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="call" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <PaperText style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                Phone
              </PaperText>
              <PaperText style={[styles.contactValue, { color: theme.colors.text }]}>
                +1 (234) 567-890
              </PaperText>
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.contactItem}>
            <View style={[styles.contactIcon, { backgroundColor: theme.colors.info + '20' }]}>
              <Icon name="location" size={22} color={theme.colors.info} />
            </View>
            <View style={styles.contactInfo}>
              <PaperText style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                Address
              </PaperText>
              <PaperText style={[styles.contactValue, { color: theme.colors.text }]}>
                123 Main St, Los Angeles, CA 90001
              </PaperText>
            </View>
          </View>
        </Surface>
      </View>

      <View style={styles.section}>
        <Button 
          mode="contained" 
          icon="email"
          style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => Linking.openURL('mailto:support@realestate.com')}
        >
          Contact Support
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  faqIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 44,
  },
  divider: {
    marginHorizontal: 16,
  },
  contactCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  contactButton: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
});
