import { Tabs, Redirect, useRouter } from 'expo-router';
import { selectHasAcceptedLegal } from '../../store/selectors';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const canonicalRole = role => ({ user: 'buyer-tenant', agent: 'agency-professional' }[role] || role || 'guest');

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const hasAcceptedLegal = useSelector(selectHasAcceptedLegal);
  const user = useSelector(state => state.auth.user);
  if (isAuthenticated && !hasAcceptedLegal) {
    return <Redirect href="/legal/consent" />;
  }

  const role = canonicalRole(user?.role || user?.canonicalRole);
  const isSuper = role === 'super-admin';
  const isAdmin = role === 'admin';
  const isStaff = isSuper || isAdmin;
  const isOperator = role === 'agency-professional' || role === 'property-owner';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isStaff ? '#0B1220' : theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0,
          height: 76 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 6,
          ...theme.shadows.md,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isStaff ? 'speedometer-outline' : isOperator ? 'briefcase-outline' : 'home'} size={size} color={color} />
          ),
          tabBarLabel: isStaff ? 'Control' : isOperator ? 'Workspace' : 'Home',
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          href: isStaff ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name={isOperator ? 'add-circle-outline' : 'search'} size={size} color={color} />,
          tabBarLabel: isOperator ? 'Create' : 'Search',
        }}
        listeners={isOperator ? {
          tabPress: e => {
            e.preventDefault();
            router.push('/listing/create');
          },
        } : undefined}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: isStaff ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name={isOperator ? 'home-outline' : 'compass'} size={size} color={color} />,
          tabBarLabel: isOperator ? 'Listings' : 'Explore',
        }}
        listeners={isOperator ? {
          tabPress: e => {
            e.preventDefault();
            router.push('/property/my-listings');
          },
        } : undefined}
      />
      <Tabs.Screen
        name="saved"
        options={{
          href: isStaff ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name={isOperator ? 'chatbubbles-outline' : 'heart'} size={size} color={color} />,
          tabBarLabel: isOperator ? 'Leads' : 'Saved',
        }}
        listeners={isOperator ? {
          tabPress: e => {
            e.preventDefault();
            router.push('/chat/inbox');
          },
        } : undefined}
      />

      <Tabs.Screen
        name="admin-users"
        options={{
          href: isSuper ? '/admin-users' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          tabBarLabel: 'Users',
        }}
      />
      <Tabs.Screen
        name="admin-review"
        options={{
          href: isStaff ? '/admin-review' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
          tabBarLabel: 'Review',
        }}
      />
      <Tabs.Screen
        name="admin-reports"
        options={{
          href: isAdmin ? '/admin-reports' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="flag-outline" size={size} color={color} />,
          tabBarLabel: 'Reports',
        }}
      />
      <Tabs.Screen
        name="admin-audit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-systems"
        options={{
          href: isSuper ? '/admin-systems' : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} />,
          tabBarLabel: 'Systems',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          tabBarLabel: 'Profile',
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
