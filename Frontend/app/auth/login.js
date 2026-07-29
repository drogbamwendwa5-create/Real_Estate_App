import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { login } from '../../Services/api';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await login(data.email, data.password);
      dispatch(loginSuccess({ user: response.user, token: response.token }));
      router.replace('/(tabs)/home');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch(loginFailure(message));
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>
       <Controller
         control={control}
         name="email"
         defaultValue=""
         rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } }}
         render={({ field: { onChange, value } }) => (
           <TextInput
             label="Email"
             placeholder="Email"
             value={value}
             onChangeText={onChange}
             autoCapitalize="none"
             keyboardType="email-address"
             error={!!errors.email}
             style={styles.input}
           />
         )}
       />
       {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}

       <Controller
         control={control}
         name="password"
         defaultValue=""
         rules={{ required: 'Password is required' }}
         render={({ field: { onChange, value } }) => (
           <TextInput
             label="Password"
             placeholder="Password"
             value={value}
             onChangeText={onChange}
             secureTextEntry={!showPassword}
             right={<TextInput.Icon icon={showPassword ? 'eye' : 'eye-off'} onPress={() => setShowPassword(!showPassword)} />}
             error={!!errors.password}
             style={styles.input}
           />
         )}
       />
      {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}

      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Login
      </Button>

      <Text style={styles.link} onPress={() => router.push('/auth/forgot-password')}>
        Forgot Password?
      </Text>
      <Text style={styles.link} onPress={() => router.push('/auth/register')}>
        Don't have an account? Register
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 8 },
  button: { marginTop: 16, paddingVertical: 8 },
  link: { color: '#2563EB', textAlign: 'center', marginTop: 12, fontSize: 14 },
});
