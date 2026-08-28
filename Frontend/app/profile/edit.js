import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import { updateUserDetails } from '../../Services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
    headerRow: { flexDirection: 'row', marginBottom: 8 },
    backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: theme.colors.text, textAlign: 'center' },
    input: { marginBottom: 8 },
    button: { marginTop: 16, paddingVertical: 8 },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Update failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Edit Profile</Text>

      <Controller
        control={control}
        name="name"
        defaultValue=""
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Full Name" value={value} onChangeText={onChange} error={!!errors.name} style={styles.input} />
        )}
      />
      {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

      <Controller
        control={control}
        name="phone"
        defaultValue=""
        rules={{ required: 'Phone is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput label="Phone" value={value} onChangeText={onChange} keyboardType="phone-pad" error={!!errors.phone} style={styles.input} />
        )}
      />
      {errors.phone && <HelperText type="error">{errors.phone.message}</HelperText>}

      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Save Changes
      </Button>
    </ScrollView>
  );
}
