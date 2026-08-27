import React, { useState } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { register } from '../../Services/api';
import { FullScreenBackground } from '../../Screens/LegacyHomeScreen';

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
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
    <View style={styles.root}>
      <FullScreenBackground scrollY={scrollY} autoPlay duration={30000} />
      <Animated.ScrollView onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })} scrollEventThrottle={16} contentContainerStyle={styles.container}>
      <View style={styles.card}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/auth/welcome')}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>
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
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050510' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 50, paddingBottom: 50 },
  card: { borderRadius: 24, padding: 20, backgroundColor: 'rgba(5, 5, 16, 0.76)' },
  backButton: { position: 'absolute', top: 12, left: 12, width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 4 },
  button: { marginTop: 16, paddingVertical: 8 },
  link: { color: '#BFDBFE', textAlign: 'center', marginTop: 12, fontSize: 14 },
});
