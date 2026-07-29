import { Stack } from 'expo-router';
import theme from '../../../theme';

export default function ProfileLayout() {
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
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="my-listings" 
        options={{ 
          headerShown: true,
          title: 'My Listings',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: true,
          title: 'Edit Profile',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: true,
          title: 'Settings',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          headerShown: true,
          title: 'Notifications',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ 
          headerShown: true,
          title: 'Help & Support',
          headerBackTitle: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          headerShown: true,
          title: 'About',
          headerBackTitle: 'Profile',
        }} 
      />
    </Stack>
  );
}
