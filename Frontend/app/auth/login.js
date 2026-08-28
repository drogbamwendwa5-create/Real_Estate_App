import React, { useState } from 'react';
import { View, StyleSheet, Alert, Animated, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { selectHasAcceptedLegal } from '../../store/selectors';
import { login } from '../../Services/api';
import { FullScreenBackground } from '../../Screens/LegacyHomeScreen';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const hasAcceptedLegal = useSelector(selectHasAcceptedLegal);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryPin, setShowRecoveryPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await login(data.email, data.password, showRecoveryPin ? data.breakGlassPin : undefined);
      dispatch(loginSuccess({ user: response.user, token: response.token }));
      router.replace(hasAcceptedLegal ? '/(tabs)/home' : '/legal/consent');
    } catch (error) {
      let message = error.response?.data?.message || error.message || 'Login failed';
      if (error.response?.status === 401 && !error.response?.data?.message) {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 500) {
        message = error.response?.data?.message || 'Server error encountered. Please try again shortly.';
      }
      if (/recovery PIN/i.test(message)) setShowRecoveryPin(true);
      dispatch(loginFailure(message));
      Alert.alert('Login Failed', message);
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

      {showRecoveryPin ? (
        <Controller
          control={control}
          name="breakGlassPin"
          defaultValue=""
          rules={{ required: 'Recovery PIN is required' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Super Admin recovery PIN"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={!!errors.breakGlassPin}
              style={styles.input}
            />
          )}
        />
      ) : null}
      {showRecoveryPin && errors.breakGlassPin ? <HelperText type="error">{errors.breakGlassPin.message}</HelperText> : null}
      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Login
      </Button>

      <Text style={styles.link} onPress={() => router.push('/auth/forgot-password')}>
        Forgot Password?
      </Text>
      <Text style={styles.link} onPress={() => router.push('/auth/register')}>
        Don't have an account? Register
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
  input: { marginBottom: 8 },
  button: { marginTop: 16, paddingVertical: 8 },
  link: { color: '#BFDBFE', textAlign: 'center', marginTop: 12, fontSize: 14 },
});
