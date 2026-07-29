import theme from '../theme';

export const GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    ...theme.shadows.md,
  },
  title: {
    ...theme.typography.h2,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  button: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  input: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  divider: {
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default GlobalStyles;
