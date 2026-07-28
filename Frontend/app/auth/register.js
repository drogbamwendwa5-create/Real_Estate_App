import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { register } from '../../Services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await register(data.name, data.email, data.password, data.phone);
      dispatch(loginSuccess({ user: response.user, token: response.token }));
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(loginFailure(message));
      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Controller control={control} name="name" defaultValue="" rules={{ required: 'Name is required' }} render={({ field: { onChange, value } }) => (
        <TextInput label="Full Name" value={value} onChangeText={onChange} error={!!errors.name} style={styles.input} />
      )} />
      {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

      <Controller control={control} name="email" defaultValue="" rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }} render={({ field: { onChange, value } }) => (
        <TextInput label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={!!errors.email} style={styles.input} />
      )} />
      {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}

      <Controller control={control} name="phone" defaultValue="" rules={{ required: 'Phone is required' }} render={({ field: { onChange, value } }) => (
        <TextInput label="Phone" value={value} onChangeText={onChange} keyboardType="phone-pad" error={!!errors.phone} style={styles.input} />
      )} />
      {errors.phone && <HelperText type="error">{errors.phone.message}</HelperText>}

      <Controller control={control} name="password" defaultValue="" rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }} render={({ field: { onChange, value } }) => (
        <TextInput label="Password" value={value} onChangeText={onChange} secureTextEntry={!showPassword} right={<TextInput.Icon icon={showPassword ? 'eye' : 'eye-off'} onPress={() => setShowPassword(!showPassword)} />} error={!!errors.password} style={styles.input} />
      )} />
      {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}

      <Controller control={control} name="confirmPassword" defaultValue="" rules={{ required: 'Confirm Password is required', validate: (v) => v === password || 'Passwords do not match' }} render={({ field: { onChange, value } }) => (
        <TextInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={!!errors.confirmPassword} style={styles.input} />
      )} />
      {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword.message}</HelperText>}

      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Register
      </Button>
      <Text style={styles.link} onPress={() => router.push('/auth/login')}>
        Already have an account? Sign In
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 4 },
  button: { marginTop: 16, paddingVertical: 8 },
  link: { color: '#2563EB', textAlign: 'center', marginTop: 12, fontSize: 14 },
});