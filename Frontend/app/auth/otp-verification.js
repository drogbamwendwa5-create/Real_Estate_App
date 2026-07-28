import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1].focus();
  };

  const onSubmit = async () => {
    setLoading(true);
    const otpCode = otp.join('');
    // TODO: Call OTP verification API
    console.log(otpCode);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            maxLength={1}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>
      <Button mode="contained" style={styles.button} onPress={onSubmit} loading={loading}>
        Verify
      </Button>
      <Text style={styles.resend} onPress={() => {}}>
        Resend OTP (30s)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 32, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpInput: { width: 48, height: 56, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  button: { marginTop: 16, paddingVertical: 8 },
  resend: { color: '#2563EB', textAlign: 'center', marginTop: 16, fontSize: 14 },
});