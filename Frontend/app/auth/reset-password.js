import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { resetPassword } from '../../Services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = router.params?.token || '';
      await resetPassword(token, data.password);
      setSuccess(true);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Reset failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.success}>Password reset successfully!</Text>
        <Button mode="contained" onPress={() => router.push('/auth/login')}>
          Go to Login
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>

      <Controller
        control={control}
        name="password"
        defaultValue=""
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="New Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.password} style={styles.input} />
        )}
      />
      {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}

      <Controller
        control={control}
        name="confirmPassword"
        defaultValue=""
        rules={{ required: 'Confirm Password is required', validate: (v) => v === control._formValues?.password || 'Passwords do not match' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.confirmPassword} style={styles.input} />
        )}
      />
      {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword.message}</HelperText>}

      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Reset Password
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
