import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import authService from '../../Services/api/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OTPVerificationScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail(data.token);
      router.replace('/(tabs)/home');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>
        <HelperText type="error">{error}</HelperText>
        <Button mode="contained" style={styles.button} onPress={() => router.canGoBack() ? router.back() : router.replace('/auth/login')}>
          Go Back
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/auth/login')}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#2563EB" />
      </TouchableOpacity>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>
      <Controller control={control} name="token" defaultValue="" rules={{ required: 'Verification code is required', minLength: { value: 6, message: 'Code must be 6 digits' } }} render={({ field: { onChange, value } }) => (
        <TextInput label="Verification Code" value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={6} error={!!errors.token} style={styles.input} />
      )} />
      {errors.token && <HelperText type="error">{errors.token.message}</HelperText>}
      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Verify
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  backButton: { alignSelf: 'flex-start', marginBottom: 8, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 32, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpInput: { width: 48, height: 56, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  button: { marginTop: 16, paddingVertical: 8 },
  resend: { color: '#2563EB', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
