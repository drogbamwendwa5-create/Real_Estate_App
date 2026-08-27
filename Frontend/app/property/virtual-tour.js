import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Text, Button, Card, Divider, TextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VirtualTourScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [tourType, setTourType] = useState('live');
  const [submitted, setSubmitted] = useState(false);

  const tourTypes = [
    { id: 'live', title: 'Live Virtual Tour', description: 'Interactive tour with an agent', icon: 'videocam' },
    { id: 'self', title: 'Self-Guided Tour', description: 'Explore at your own pace', icon: 'walk' },
  ];

  const timeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

  const handleSubmit = () => {
    // TODO: Wire to backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <View style={[styles.successIconContainer, { backgroundColor: theme.colors.surface }]}>
              <Icon name="checkmark-done" size={48} color={theme.colors.success} />
            </View>
            <Title style={[styles.successTitle, { color: theme.colors.text }]}>
              Tour Booked!
            </Title>
            <Paragraph style={[styles.successText, { color: theme.colors.textSecondary }]}>
              Your virtual tour has been scheduled. You'll receive a confirmation email shortly.
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
              Virtual Tour
            </Text>
            <Paragraph style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Experience this property from anywhere
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Tour Type
          </Text>
          {tourTypes.map((type) => (
            <Card
              key={type.id}
              style={[
                styles.tourTypeCard,
                { 
                  backgroundColor: theme.colors.surface,
                  borderColor: tourType === type.id ? theme.colors.primary : theme.colors.border,
                }
              ]}
              onPress={() => setTourType(type.id)}
            >
              <Card.Content style={styles.tourTypeContent}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name={type.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.tourTypeInfo}>
                  <Text style={[styles.tourTypeTitle, { color: theme.colors.text }]}>
                    {type.title}
                  </Text>
                  <Text style={[styles.tourTypeDesc, { color: theme.colors.textSecondary }]}>
                    {type.description}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Date
          </Text>
          <View style={styles.dateGrid}>
            {['Today', 'Tomorrow', 'Sat, 15', 'Sun, 16', 'Mon, 17', 'Tue, 18'].map((date, index) => (
              <Card
                key={index}
                style={[
                  styles.dateCard,
                  { 
                    backgroundColor: selectedDate === date ? theme.colors.primary : theme.colors.surface,
                    borderColor: selectedDate === date ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Card.Content style={styles.dateCardContent}>
                  <Text style={[styles.dateText, { color: selectedDate === date ? '#FFFFFF' : theme.colors.text }]}>
                    {date}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Time
          </Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time, index) => (
              <Card
                key={index}
                style={[
                  styles.timeCard,
                  { 
                    backgroundColor: selectedTime === time ? theme.colors.primary : theme.colors.surface,
                    borderColor: selectedTime === time ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Card.Content style={styles.timeCardContent}>
                  <Text style={[styles.timeText, { color: selectedTime === time ? '#FFFFFF' : theme.colors.text }]}>
                    {time}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Information
          </Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Full Name
              </Paragraph>
              <TextInput
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Email
              </Paragraph>
              <TextInput
                mode="outlined"
                keyboardType="email-address"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Phone
              </Paragraph>
              <TextInput
                mode="outlined"
                keyboardType="phone-pad"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          disabled={!selectedDate || !selectedTime}
        >
          Book Virtual Tour
        </Button>

        <View style={{ height: theme.spacing.lg }} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tourTypeCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  tourTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tourTypeInfo: {
    flex: 1,
  },
  tourTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tourTypeDesc: {
    fontSize: 14,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateCard: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '30%',
  },
  dateCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '30%',
  },
  timeCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 12,
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
  submitButton: {
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 400,
  },
  successIconContainer: {
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