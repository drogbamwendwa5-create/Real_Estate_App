export const getTheme = (isDarkMode) => {
  const colors = {
    primary: isDarkMode ? '#60A5FA' : '#1E3A8A', // Bright blue on dark for contrast, deep blue on light
    secondary: isDarkMode ? '#93C5FD' : '#3B82F6', // Lighter blue for accents
    accent: isDarkMode ? '#34D399' : '#10B981', // Brighter emerald on dark for call-to-action
    gold: '#FFD700', // Keep gold for highlighting
    success: isDarkMode ? '#34D399' : '#10B981',
    warning: isDarkMode ? '#FBBF24' : '#F59E0B',
    info: isDarkMode ? '#93C5FD' : '#3B82F6',
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    card: isDarkMode ? '#1E293B' : '#FFFFFF', // Dark slate for cards in dark mode
    background: isDarkMode ? '#0F172A' : '#F8FAFC', // Very dark blue for background in dark mode, light gray for light
    surface: isDarkMode ? '#1E293B' : '#FFFFFF',
    error: isDarkMode ? '#F87171' : '#DC2626',
    text: isDarkMode ? '#F8FAFC' : '#0F172A', // Light text on dark, dark text on light
    textSecondary: isDarkMode ? '#CBD5E1' : '#64748B', // Brighter slate on dark for readable secondary text
    textMuted: isDarkMode ? '#94A3B8' : '#64748B', // Dimmed but still legible on dark
    disabled: isDarkMode ? '#64748B' : '#CBD5E1',
    border: isDarkMode ? '#475569' : '#E2E8F0', // Brighter border on dark for clearer separation
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const typography = {
    display: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, color: colors.text },
    h1: { fontSize: 30, fontWeight: '700', letterSpacing: -0.25, color: colors.text },
    h2: { fontSize: 24, fontWeight: '600', letterSpacing: -0.15, color: colors.text },
    h3: { fontSize: 20, fontWeight: '600', color: colors.text },
    h4: { fontSize: 18, fontWeight: '600', color: colors.text },
    subtitle: { fontSize: 18, fontWeight: '500', color: colors.text },
    body: { fontSize: 16, lineHeight: 24, color: colors.text },
    bodySmall: { fontSize: 14, lineHeight: 20, color: colors.text },
    caption: { fontSize: 14, color: colors.textSecondary },
    button: { fontSize: 14, fontWeight: '600', color: colors.text },
    label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
    small: { fontSize: 12, color: colors.textSecondary },
  };

  const shadows = {
    sm: { boxShadow: `0px 1px 2px rgba(0, 0, 0, ${isDarkMode ? 0.3 : 0.05})` },
    md: { boxShadow: `0px 3px 4px rgba(0, 0, 0, ${isDarkMode ? 0.4 : 0.1})` },
    lg: { boxShadow: `0px 6px 8px rgba(0, 0, 0, ${isDarkMode ? 0.5 : 0.15})` },
  };

  return { colors, spacing, typography, shadows };
};

// Default light theme export for backward compatibility
const theme = getTheme(false);
export default theme;