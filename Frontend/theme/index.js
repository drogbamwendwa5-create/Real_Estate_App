export const getTheme = (isDarkMode) => {
  const colors = {
    primary: '#2563EB',
    secondary: '#3B82F6',
    accent: '#10B981',
    gold: '#FFD700',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    background: isDarkMode ? '#000000' : '#F8FAFC',
    surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    error: '#DC2626',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    textSecondary: isDarkMode ? '#B0B0B0' : '#475569',
    textMuted: '#94A3B8',
    disabled: '#CBD5E1',
    border: isDarkMode ? '#333333' : '#E2E8F0',
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const typography = {
    display: { fontSize: 32, fontWeight: '700', color: colors.text },
    h1: { fontSize: 28, fontWeight: '700', color: colors.text },
    h2: { fontSize: 22, fontWeight: '700', color: colors.text },
    h3: { fontSize: 18, fontWeight: '600', color: colors.text },
    h4: { fontSize: 16, fontWeight: '600', color: colors.text },
    subtitle: { fontSize: 18, fontWeight: '500', color: colors.text },
    body: { fontSize: 16, lineHeight: 24, color: colors.text },
    bodySmall: { fontSize: 14, lineHeight: 20, color: colors.text },
    caption: { fontSize: 14, color: colors.textSecondary },
    button: { fontSize: 14, fontWeight: '600', color: colors.text },
    label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
    small: { fontSize: 12, color: colors.textSecondary },
  };

  const shadows = {
    sm: { elevation: 1, shadowColor: '#000', shadowOpacity: isDarkMode ? 0.3 : 0.05, shadowRadius: 2 },
    md: { elevation: 3, shadowColor: '#000', shadowOpacity: isDarkMode ? 0.4 : 0.1, shadowRadius: 4 },
    lg: { elevation: 6, shadowColor: '#000', shadowOpacity: isDarkMode ? 0.5 : 0.15, shadowRadius: 8 },
  };

  return { colors, spacing, typography, shadows };
};

// Default light theme export for backward compatibility
const theme = getTheme(false);
export default theme;
