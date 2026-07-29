import React from 'react';
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { Surface, Text as PaperText, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <PaperText style={[styles.title, { color: theme.colors.text }]}>About</PaperText>
      </View>

      <View style={styles.section}>
        <Surface style={[styles.logoCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Icon name="home" size={32} color="#FFFFFF" />
          </View>
          <PaperText style={[styles.appName, { color: theme.colors.text }]}>
            Real Estate
          </PaperText>
          <PaperText style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Find Your Dream Home
          </PaperText>
          <PaperText style={[styles.version, { color: theme.colors.textMuted }]}>
            Version 1.0.0
          </PaperText>
        </Surface>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          ABOUT US
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <PaperText style={[styles.description, { color: theme.colors.textSecondary }]}>
            We're on a mission to make finding your dream home a seamless and enjoyable experience. Our platform connects buyers, renters, and property owners with trusted agents and a vast inventory of listings.
          </PaperText>
        </Surface>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          LEGAL
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Icon name="shield" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <PaperText style={[styles.menuTitle, { color: theme.colors.text }]}>
                Privacy Policy
              </PaperText>
              <PaperText style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                How we protect your data
              </PaperText>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
              <Icon name="document" size={22} color={theme.colors.info} />
            </View>
            <View style={styles.menuContent}>
              <PaperText style={[styles.menuTitle, { color: theme.colors.text }]}>
                Terms of Service
              </PaperText>
              <PaperText style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Terms and conditions
              </PaperText>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <Icon name="code" size={22} color={theme.colors.success} />
            </View>
            <View style={styles.menuContent}>
              <PaperText style={[styles.menuTitle, { color: theme.colors.text }]}>
                Open Source Licenses
              </PaperText>
              <PaperText style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                Third-party acknowledgments
              </PaperText>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Surface>
      </View>

      <View style={styles.section}>
        <Button 
          mode="outlined" 
          icon="globe"
          style={[styles.websiteButton, { borderColor: theme.colors.primary }]}
          onPress={() => Linking.openURL('https://realestate.com')}
        >
          Visit Website
        </Button>
        <PaperText style={[styles.footer, { color: theme.colors.textMuted }]}>
          © 2024 Real Estate Inc. All rights reserved.
        </PaperText>
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
  logoCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
  },
  divider: {
    marginHorizontal: 16,
  },
  websiteButton: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    fontSize: 13,
  },
});
