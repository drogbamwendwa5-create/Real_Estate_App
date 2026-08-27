import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Text, Button, TextInput, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';

export default function MortgageCalculatorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  
  const [principal, setPrincipal] = useState(params.price ? String(params.price) : '');
  const [interestRate, setInterestRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateMortgage = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(years) * 12;
    
    if (p && r && n) {
      const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setMonthlyPayment(monthly);
    }
  };

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
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Mortgage Calculator
            </Text>
            <Paragraph style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Estimate your monthly payments
            </Paragraph>
          </View>
        </View>

        {params.price && (
          <Card style={[styles.priceCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Paragraph style={{ color: theme.colors.textSecondary }}>Property Price</Paragraph>
              <Title style={[styles.cardPrice, { color: theme.colors.primary }]}>
                ${parseFloat(params.price).toLocaleString()}
              </Title>
            </Card.Content>
          </Card>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Loan Amount ($)
            </Paragraph>
            <TextInput
              mode="outlined"
              value={principal}
              onChangeText={setPrincipal}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Interest Rate (%)
            </Paragraph>
            <TextInput
              mode="outlined"
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Loan Term (years)
            </Paragraph>
            <TextInput
              mode="outlined"
              value={years}
              onChangeText={setYears}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <Button 
            mode="contained" 
            onPress={calculateMortgage}
            style={[styles.calculateButton, { backgroundColor: theme.colors.primary }]}
          >
            Calculate
          </Button>

          {monthlyPayment && (
            <Card style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Paragraph style={{ color: theme.colors.textSecondary }}>
                  Estimated Monthly Payment
                </Paragraph>
                <Title style={[styles.monthlyPayment, { color: theme.colors.primary }]}>
                  ${monthlyPayment.toFixed(2)}
                </Title>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Paragraph style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Total Payment
                    </Paragraph>
                    <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                      ${(monthlyPayment * parseFloat(years) * 12).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Paragraph style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Total Interest
                    </Paragraph>
                    <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                      ${((monthlyPayment * parseFloat(years) * 12) - parseFloat(principal)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
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
  priceCard: {
    marginBottom: 24,
    borderRadius: 16,
  },
  cardPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  form: {
    gap: 16,
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
  calculateButton: {
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  resultCard: {
    borderRadius: 16,
    marginTop: 24,
  },
  monthlyPayment: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
