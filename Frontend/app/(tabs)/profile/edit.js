import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../store/slices/authSlice';
import { useTheme } from '../../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import UserService from '../../../Services/api/userService';
import { updateUserDetails } from '../../../Services/api';
import { useAuth } from '../../../Hooks/useAuth';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user: hookUser, setUser } = useAuth();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = reduxUser || hookUser;
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, reset } = useForm({ defaultValues: { name: '', email: '', phone: '', bio: '' } });

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', bio: user?.bio || '' });
  }, [user, reset]);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) setAvatar(result.assets[0]);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const profileResponse = await updateUserDetails(data);
      let updatedUser = profileResponse.data;

      if (avatar) {
        const formData = new FormData();
        formData.append('image', {
          uri: avatar.uri,
          name: avatar.fileName || `avatar-${Date.now()}.jpg`,
          type: avatar.mimeType || 'image/jpeg',
        });
        const avatarResponse = await UserService.uploadAvatar(formData);
        updatedUser = { ...updatedUser, avatar: avatarResponse.data };
      }

      setUser(updatedUser);
      dispatch(updateUser(updatedUser));
      Alert.alert('Success', 'Profile updated successfully');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <Surface style={[styles.avatarSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.avatarContainer}>
          {avatar?.uri || user?.avatar?.url ? (
            <Image source={{ uri: avatar?.uri || user.avatar.url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}> 
              <Text style={styles.avatarText}>{(user?.name || 'User').slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity onPress={pickAvatar} style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary }]}>
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
          loading={saving}
          disabled={saving}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
        >
          {saving ? 'Saving...' : 'Save Changes'}
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
