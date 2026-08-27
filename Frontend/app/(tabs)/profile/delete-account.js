import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import { deleteAccount } from '../../../Services/api';
import { removeToken } from '../../../Utils/storage';
import { useAuth } from '../../../Hooks/useAuth';

export default function DeleteAccountScreen({ navigation }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleContinue = () => {
    if (confirmText !== 'DELETE') {
      setErrors({ confirmText: 'Please type DELETE to confirm' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      await deleteAccount(password);
      
      await removeToken();
      setUser(null);
      
      Alert.alert('Account Deleted', 'Your account has been permanently deleted', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.warningBox, { backgroundColor: theme.colors.error + '15' }]}>
        <Ionicons name="warning" size={24} color={theme.colors.error} />
        <View style={styles.warningContent}>
          <Text style={[styles.warningTitle, { color: theme.colors.error }]}>
            This action cannot be undone
          </Text>
          <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
            All your data will be permanently removed including:
          </Text>
          <View style={styles.warningList}>
            <View style={styles.warningListItem}>
              <Ionicons name="close-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.warningListItemText, { color: theme.colors.textSecondary }]}>
                Your profile and account information
              </Text>
            </View>
            <View style={styles.warningListItem}>
              <Ionicons name="close-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.warningListItemText, { color: theme.colors.textSecondary }]}>
                All your property listings
              </Text>
            </View>
            <View style={styles.warningListItem}>
              <Ionicons name="close-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.warningListItemText, { color: theme.colors.textSecondary }]}>
                Favorites and saved properties
              </Text>
            </View>
            <View style={styles.warningListItem}>
              <Ionicons name="close-circle" size={16} color={theme.colors.error} />
              <Text style={[styles.warningListItemText, { color: theme.colors.textSecondary }]}>
                Messages and conversations
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.confirmContainer}>
        <Text style={[styles.confirmLabel, { color: theme.colors.text }]}>
          Type <Text style={[styles.confirmText, { color: theme.colors.error }]}>DELETE</Text> to confirm
        </Text>
        <TextInput
          style={[
            styles.confirmInput,
            {
              borderColor: errors.confirmText ? theme.colors.error : theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Type DELETE"
          placeholderTextColor={theme.colors.textSecondary}
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {errors.confirmText && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.confirmText}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={() => navigation.canGoBack?.() ? navigation.goBack() : router.replace('/(tabs)/profile')}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.colors.error,
              opacity: confirmText === 'DELETE' ? 1 : 0.5,
            },
          ]}
          onPress={handleContinue}
          disabled={confirmText !== 'DELETE'}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.authBox, { backgroundColor: theme.colors.warning + '15' }]}>
        <Ionicons name="lock-closed" size={24} color={theme.colors.warning} />
        <Text style={[styles.authTitle, { color: theme.colors.text }]}>
          Enter your password
        </Text>
        <Text style={[styles.authText, { color: theme.colors.textSecondary }]}>
          For security, please enter your password to confirm account deletion
        </Text>
      </View>

      <View style={styles.passwordContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
        <View style={[styles.passwordWrapper, { borderColor: errors.password ? theme.colors.error : theme.colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: theme.colors.text }]}
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.password}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: theme.colors.border }]}
          onPress={() => setStep(1)}
          disabled={loading}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            {
              backgroundColor: theme.colors.error,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.deleteButtonText}>
            {loading ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>
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
            <Text style={[styles.title, { color: theme.colors.error }]}>Delete Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {step === 1 ? 'Please review the consequences' : 'Final confirmation required'}
            </Text>
          </View>
        </View>

        <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          {step === 1 ? renderStep1() : renderStep2()}
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
  stepContainer: {
    gap: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 12,
  },
  warningList: {
    gap: 8,
  },
  warningListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningListItemText: {
    fontSize: 13,
    flex: 1,
  },
  confirmContainer: {
    marginTop: 8,
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  confirmText: {
    fontWeight: '700',
  },
  confirmInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'monospace',
  },
  authBox: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  authText: {
    fontSize: 14,
    lineHeight: 20,
  },
  passwordContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  passwordInput: {
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});