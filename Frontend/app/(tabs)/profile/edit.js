import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit Profile</Text>
      </View>

      <Surface style={[styles.avatarSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary }]}>
            <Icon name="camera" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.avatarHint, { color: theme.colors.textSecondary }]}>
          Tap to change photo
        </Text>
      </Surface>

      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="account" color={theme.colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" color={theme.colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Phone"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" color={theme.colors.textSecondary} />}
            />
          )}
        />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Bio"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              left={<TextInput.Icon icon="text" color={theme.colors.textSecondary} />}
            />
          )}
        />

        <Button 
          mode="contained" 
          onPress={handleSubmit(onSubmit)}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
        >
          Save Changes
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    borderRadius: 12,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
