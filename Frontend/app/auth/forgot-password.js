import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import authService from '../../Services/api/authService';

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.success}>Password reset link sent to your email!</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Enter your email to reset</Text>
      <Controller control={control} name="email" defaultValue="" rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }} render={({ field: { onChange, value } }) => (
        <TextInput label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={!!errors.email} style={styles.input} />
      )} />
      {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Send Reset Link
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 8 },
  button: { marginTop: 16, paddingVertical: 8 },
  success: { fontSize: 16, textAlign: 'center', color: '#16A34A', marginBottom: 24 },
});
