import { Stack } from 'expo-router';
import { useTheme } from '../../../../Context/ThemeContext';

export default function MyListingsLayout() {
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
