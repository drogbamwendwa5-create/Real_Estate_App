import { Stack } from 'expo-router';
import { useTheme } from '../../../Context/ThemeContext';

export default function ProfileLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
        presentation: 'card',
        tabBarStyle: {
          display: 'flex',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="my-listings" 
        options={{ 
          headerShown: false,
          title: 'My Listings',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Edit Profile',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: 'Notifications',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          title: 'Help & Support',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          title: 'About',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="change-password" 
        options={{ 
          title: 'Change Password',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="delete-account" 
        options={{ 
          title: 'Delete Account',
          headerBackTitle: 'Profile',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
