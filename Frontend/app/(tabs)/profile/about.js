import React from 'react';
import { ScrollView, StyleSheet, Text, Linking, TouchableOpacity, View } from 'react-native';
import { Surface, Text as PaperText, Button, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

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
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          PRIVACY POLICY
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <PaperText style={[styles.policyTitle, { color: theme.colors.text }]}>
            Privacy Policy
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Last Updated: July 31, 2024</Text>
          </PaperText>
          
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>1. Introduction</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Real Estate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>2. Information We Collect</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We may collect information about you in a variety of ways, including:
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Personal Data: Name, email address, phone number, and other contact information you provide when registering or using our services.</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Usage Data: Information about how you access and use our app, including your device type, operating system, browser type, IP address, and browsing patterns.</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Location Data: With your consent, we may collect real-time or approximate location information to provide location-based services.</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Property Preferences: Information about your property search preferences, saved listings, and interactions with properties.</Text>
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>3. How We Use Your Information</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We may use the information we collect from you to:
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Provide, maintain, and improve our services</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Process transactions and send related information</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Send administrative information, such as updates, security alerts, and support messages</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Respond to your comments, questions, and requests</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Personalize your experience and deliver content relevant to your interests</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Monitor and analyze trends, usage, and activities</Text>
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>4. Disclosure of Your Information</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We may share your information with:
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Service providers who perform services on our behalf</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Real estate agents and property owners (with your consent)</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Legal authorities when required by law or to protect our rights</Text>
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>5. Data Security</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>6. Your Data Protection Rights</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Depending on your location, you may have the following rights:
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to access your personal data</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to correct inaccurate data</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to delete your personal data</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to restrict processing</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to data portability</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Right to object to processing</Text>
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>7. Children's Privacy</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>8. Changes to This Privacy Policy</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>9. Contact Us</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at privacy@realestate.com.
          </PaperText>
        </Surface>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          TERMS OF SERVICE
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <PaperText style={[styles.policyTitle, { color: theme.colors.text }]}>
            Terms of Service
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Last Updated: July 31, 2024</Text>
          </PaperText>
          
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>1. Agreement to Terms</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            By accessing or using our mobile application and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>2. Description of Services</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Real Estate provides a platform for property search, listing management, and connecting property buyers, renters, and sellers. We facilitate connections but are not a party to any transactions between users.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>3. User Accounts</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must notify us immediately of any unauthorized access to or use of your account.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>4. User Content</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            You retain ownership of any content you submit to our platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in connection with our services.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>5. Prohibited Activities</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            You agree not to:
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Use our services for any illegal purpose</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Post false, misleading, or fraudulent content</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Harass, abuse, or harm other users</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Attempt to gain unauthorized access to our systems</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bullet}>• Use automated means to access or scrape our services</Text>
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>6. Intellectual Property</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Our app and its original content, features, and functionality are owned by Real Estate Inc. and are protected by international copyright, trademark, and other intellectual property laws.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>7. Limitation of Liability</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            To the maximum extent permitted by law, Real Estate Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>8. Termination</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>9. Governing Law</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>10. Contact Information</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            If you have any questions about these Terms, please contact us at legal@realestate.com.
          </PaperText>
        </Surface>
      </View>

      <View style={styles.section}>
        <PaperText style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
          OPEN SOURCE LICENSES
        </PaperText>
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <PaperText style={[styles.policyTitle, { color: theme.colors.text }]}>
            Open Source Licenses
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            This application uses open-source software components. We gratefully acknowledge the contributions of these projects:
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Native</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) Meta Platforms, Inc. and affiliates.
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Expo</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Native Paper</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2018 Callstack Open Source
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Redux</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2015-present Dan Abramov and the Redux documentation authors
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Hook Form</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2019-present Beier (bluebill1049)
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Yup</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2014 Jason Quense
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Axios</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2014-present Matt Zabriskie
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Native Vector Icons</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2015-2022 Joel Arvidsson
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Native Maps</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2020 Airbnb, Inc.
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>React Navigation</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2017 React Navigation Community
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Express (Backend)</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2009-2024 TJ Holowaychuk and contributors
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Mongoose</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            License: MIT License
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Copyright (c) 2010-2024 Guillermo Rauch and contributors
          </PaperText>

          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            <Text style={styles.bold}>Full License Texts</Text>
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            Full license texts for all dependencies are available in the respective package repositories. All MIT-licensed components can be freely used, modified, and distributed under the terms of the MIT License.
          </PaperText>
          <PaperText style={[styles.policyText, { color: theme.colors.textSecondary }]}>
            For the complete list of dependencies and their licenses, please visit our GitHub repository or contact us at opensource@realestate.com.
          </PaperText>
        </Surface>
      </View>

      <View style={styles.section}>
        <Button 
          mode="outlined" 
          icon="web"
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
  policyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  bullet: {
    marginLeft: 8,
    marginTop: 4,
  },
});