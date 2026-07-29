import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import { updateUserDetails } from '../../Services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await updateUserDetails(data);
      dispatch(updateUser(response.data));
      router.back();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Update failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 8 },
  button: { marginTop: 16, paddingVertical: 8 },
});
