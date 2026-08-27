import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import { updatePassword } from '../../../Services/api';
import { removeToken } from '../../../Utils/storage';
import { useAuth } from '../../../Hooks/useAuth';

export default function ChangePasswordScreen({ navigation }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await updatePassword(formData.currentPassword, formData.newPassword);
      
      Alert.alert('Success', 'Password updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.canGoBack?.() ? navigation.goBack() : router.replace('/(tabs)/profile'),
        },
      ]);

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const renderPasswordInput = (label, field, placeholder) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: errors[field] ? theme.colors.error : theme.colors.border }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={formData[field]}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          secureTextEntry={!showPasswords[field]}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => togglePasswordVisibility(field)} style={styles.eyeIcon}>
          <Ionicons
            name={showPasswords[field] ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {errors[field] && <Text style={[styles.error, { color: theme.colors.error }]}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={{ backgroundColor: theme.colors.background }}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
            style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Change Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Update your account password
            </Text>
          </View>
        </View>

        <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          {renderPasswordInput('Current Password', 'currentPassword', 'Enter current password')}
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          {renderPasswordInput('New Password', 'newPassword', 'Enter new password')}
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          {renderPasswordInput('Confirm New Password', 'confirmPassword', 'Confirm new password')}

          <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Password must be at least 6 characters long
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  formContainer: {
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});