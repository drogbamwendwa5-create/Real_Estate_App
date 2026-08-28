import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Context/ThemeContext';
import { LEGAL } from '../../Constants';
import { acceptLegal } from '../../store/slices/authSlice';
import { selectHasAcceptedLegal } from '../../store/selectors';

export default function LegalConsentScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const alreadyAccepted = useSelector(selectHasAcceptedLegal);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const canAccept = alreadyAccepted || (acceptPrivacy && acceptTerms);

  const handleAccept = () => {
    if (!canAccept) return;
    if (!alreadyAccepted) {
      dispatch(acceptLegal({ acceptedAt: new Date().toISOString(), version: LEGAL.version }));
      router.replace('/(tabs)/home');
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Ionicons name="shield-checkmark-outline" size={48} color={theme.colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Legal & Privacy</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Before you can use Real Estate, please review and accept our Privacy Policy and Terms of Use (effective {LEGAL.effectiveDate}).
        </Text>

        {alreadyAccepted ? (
          <Text style={[styles.note, { color: theme.colors.success }]}>
            You have already accepted the current version. You can review the documents below or continue.
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.linkRow, { borderColor: theme.colors.border }]}
          onPress={() => router.push('/legal/privacy')}
        >
          <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.linkLabel, { color: theme.colors.text }]}>Read Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow, { borderColor: theme.colors.border }]}
          onPress={() => router.push('/legal/terms')}
        >
          <Ionicons name="document-outline" size={22} color={theme.colors.primary} />
          <Text style={[styles.linkLabel, { color: theme.colors.text }]}>Read Terms of Use</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.checkRow, { borderColor: theme.colors.border }]}>
          <Checkbox
            status={acceptPrivacy ? 'checked' : 'unchecked'}
            onPress={() => setAcceptPrivacy((v) => !v)}
            color={theme.colors.primary}
          />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setAcceptPrivacy((v) => !v)}>
            <Text style={[styles.checkLabel, { color: theme.colors.text }]}>
              I have read and agree to the Privacy Policy.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.checkRow, { borderColor: theme.colors.border }]}>
          <Checkbox
            status={acceptTerms ? 'checked' : 'unchecked'}
            onPress={() => setAcceptTerms((v) => !v)}
            color={theme.colors.primary}
          />
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setAcceptTerms((v) => !v)}>
            <Text style={[styles.checkLabel, { color: theme.colors.text }]}>
              I have read and agree to the Terms of Use.
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          style={[styles.button, !canAccept && styles.buttonDisabled]}
          disabled={!canAccept || loading}
          loading={loading}
          onPress={handleAccept}
        >
          {alreadyAccepted ? 'Continue' : 'Accept & Continue'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  icon: { alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  note: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  linkLabel: { flex: 1, fontSize: 15, marginLeft: 12, fontWeight: '600' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  checkLabel: { fontSize: 14, lineHeight: 20, paddingRight: 8 },
  button: { marginTop: 12, paddingVertical: 6 },
  buttonDisabled: { opacity: 0.6 },
});
