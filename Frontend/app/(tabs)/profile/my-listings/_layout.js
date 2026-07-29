import { Stack } from 'expo-router';
import theme from '../../../../theme';

export default function MyListingsLayout() {
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
        tabBarStyle: {
          display: 'flex',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Listings',
          headerBackTitle: 'Profile',
        }} 
      />
    </Stack>
  );
}
