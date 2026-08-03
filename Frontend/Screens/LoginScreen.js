import React, { useRef, useEffect } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { login } from '../Hooks/useAuth';

const FRAMES = [
  require('../assets/hero_frame5.jpg'),
  require('../assets/hero_frame6.jpg'),
  require('../assets/hero_frame1.jpg'),
  require('../assets/hero_frame2.jpg'),
  require('../assets/hero_frame7.jpg'),
  require('../assets/hero_frame3.jpg'),
  require('../assets/hero_frame8.jpg'),
  require('../assets/hero_frame4.jpg'),
];

const FRAME_SCROLL = 350;
const CYCLE_LENGTH = FRAMES.length * FRAME_SCROLL;
const OVERLAP = FRAME_SCROLL * 0.4;

const buildFrameOpacity = (i, scrollY) => {
  const fadeInStart = Math.max(0, i * FRAME_SCROLL - OVERLAP);
  const peakStart = i * FRAME_SCROLL;
  const peakEnd = i * FRAME_SCROLL + OVERLAP;
  const fadeOutEnd = (i + 1) * FRAME_SCROLL;
  if (i === 0) {
    return scrollY.interpolate({
      inputRange: [0, peakEnd, fadeOutEnd],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });
  }
  if (i === FRAMES.length - 1) {
    return scrollY.interpolate({
      inputRange: [fadeInStart, peakStart],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }
  return scrollY.interpolate({
    inputRange: [fadeInStart, peakStart, peakEnd, fadeOutEnd],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });
};

const FullScreenBackground = () => {
  const timeline = useRef(new Animated.Value(0)).current;
  const kbScale = useRef(new Animated.Value(1)).current;
  const kbX = useRef(new Animated.Value(0)).current;
  const kbY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(timeline, { toValue: CYCLE_LENGTH, duration: 30000, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [timeline]);

  useEffect(() => {
    const run = (flip = false) => {
      Animated.parallel([
        Animated.timing(kbScale, { toValue: flip ? 1 : 1.08, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbX, { toValue: flip ? 0 : (Math.random() - 0.5) * 24, duration: 9000, useNativeDriver: true }),
        Animated.timing(kbY, { toValue: flip ? 0 : (Math.random() - 0.5) * 14, duration: 9000, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(!flip); });
    };
    run();
  }, []);

  const loopScrollY = Animated.modulo(timeline, CYCLE_LENGTH);
  const frameOpacities = FRAMES.map((_, i) => buildFrameOpacity(i, loopScrollY));

  const overlayDark = loopScrollY.interpolate({
    inputRange: [0, CYCLE_LENGTH],
    outputRange: [0.45, 0.78],
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: kbScale }, { translateX: kbX }, { translateY: kbY }] },
        ]}
      >
        {FRAMES.map((src, i) => (
          <Animated.Image
            key={i}
            source={src}
            style={[StyleSheet.absoluteFill, styles.bgFrame, { opacity: frameOpacities[i] }]}
            resizeMode="cover"
          />
        ))}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayDark }]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(2,2,15,0.3)', 'rgba(2,2,15,0.55)', 'rgba(2,2,15,0.88)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FullScreenBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  inputIcon: {
    marginRight: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
  },
  footerLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  bgFrame: {
    width: '100%',
    height: '100%',
  },
});

export default LoginScreen;