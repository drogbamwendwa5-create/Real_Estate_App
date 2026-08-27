import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Text, Button, TextInput, Card, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ScheduleViewingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // TODO: Wire to backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="checkmark-done" size={48} color={theme.colors.success} />
            </View>
            <Title style={[styles.successTitle, { color: theme.colors.text }]}>
              Request Sent!
            </Title>
            <Paragraph style={[styles.successText, { color: theme.colors.textSecondary }]}>
              We'll contact you shortly to confirm your viewing appointment.
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              Back to Property
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
            style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Schedule a Viewing
            </Text>
            <Paragraph style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Book a time to see this property
            </Paragraph>
          </View>
        </View>

        {params.price && (
          <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Paragraph style={{ color: theme.colors.textSecondary }}>Property</Paragraph>
              <Title style={[styles.cardTitle, { color: theme.colors.text }]}>
                {params.title || 'Luxury Villa'}
              </Title>
              <Paragraph style={{ color: theme.colors.textSecondary }}>
                {params.location || 'Beverly Hills, CA'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Date
              </Paragraph>
              <TextInput
                mode="outlined"
                value={date}
                onChangeText={setDate}
                placeholder="MM/DD/YYYY"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="calendar" color={theme.colors.textSecondary} />}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Time
              </Paragraph>
              <TextInput
                mode="outlined"
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="clock" color={theme.colors.textSecondary} />}
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Title style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Information
          </Title>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Full Name
            </Paragraph>
            <TextInput
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="account" color={theme.colors.textSecondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Email
            </Paragraph>
            <TextInput
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="email" color={theme.colors.textSecondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Phone
            </Paragraph>
            <TextInput
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="phone" color={theme.colors.textSecondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Notes (optional)
            </Paragraph>
            <TextInput
              mode="outlined"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.submitButtonContent}
          >
            Confirm Booking
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 400,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    borderRadius: 12,
    minWidth: 200,
  },
});
