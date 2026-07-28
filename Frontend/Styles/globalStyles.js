import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../constants';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenPadding: {
    padding: SIZES.padding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: SHADOWS.light,
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  button: {
    borderRadius: SIZES.radius,
    paddingVertical: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.font,
    marginBottom: SIZES.margin,
  },
  successText: {
    color: COLORS.success,
    fontSize: SIZES.font,
  },
  heading: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  subheading: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  body: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 20,
  },
});