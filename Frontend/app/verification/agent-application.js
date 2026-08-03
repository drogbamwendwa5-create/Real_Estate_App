import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTheme } from '../../Context/ThemeContext';
import { getMyVerification, submitProfessionalApplication } from '../../Services/api';

export default function AgentApplication() {
  const { theme } = useTheme();
  const user = useSelector(state => state.auth.user);
  const [form, setForm] = useState({ company: '', licenseNumber: '', experience: '', message: '' });
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const response = await getMyVerification();
      setLatest((response?.data || []).find(item => item.type === 'professional') || null);
    } catch (error) {
      setNotice('Sign in to submit an agent application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.experience.trim() || !form.message.trim()) {
      setNotice('Add your experience and a short introduction before submitting.');
      return;
    }
    setSaving(true);
    setNotice('');
    try {
      await submitProfessionalApplication(form);
      setNotice('Application submitted. Your account remains a buyer until approval.');
      await load();
    } catch (error) {
      setNotice(error?.response?.data?.message || 'Could not submit your application.');
    } finally {
      setSaving(false);
    }
  };

  const status = latest?.status || user?.professionalVerification?.status;
  const canApply = !status || ['rejected', 'expired'].includes(status);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Apply as an agent', headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="briefcase-outline" size={34} color="#fff" />
          <Text style={styles.heroTitle}>List properties professionally.</Text>
          <Text style={styles.heroCopy}>Submit your professional details for review. You can publish listings after an admin approves your application.</Text>
        </View>

        {status ? <View style={[styles.statusCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}><Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>APPLICATION STATUS</Text><Text style={[styles.status, { color: status === 'approved' ? theme.colors.success : status === 'rejected' ? theme.colors.error : theme.colors.warning }]}>{status.toUpperCase()}</Text><Text style={[styles.statusCopy, { color: theme.colors.textSecondary }]}>{status === 'approved' ? 'You are now a verified agency professional.' : status === 'pending' ? 'An administrator will review your details before granting listing access.' : 'You can update your information and submit again.'}</Text></View> : null}

        {loading ? <ActivityIndicator color={theme.colors.primary} /> : null}
        {notice ? <View style={[styles.notice, { backgroundColor: theme.colors.surface }]}><Text style={[styles.noticeText, { color: theme.colors.text }]}>{notice}</Text></View> : null}

        {canApply ? <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Field label="Company or agency" value={form.company} onChangeText={value => setForm({ ...form, company: value })} placeholder="Optional" theme={theme} />
          <Field label="License or registration number" value={form.licenseNumber} onChangeText={value => setForm({ ...form, licenseNumber: value })} placeholder="Optional" theme={theme} />
          <Field label="Years of experience" value={form.experience} onChangeText={value => setForm({ ...form, experience: value })} placeholder="e.g. 5 years" theme={theme} />
          <Field label="Tell us about your work" value={form.message} onChangeText={value => setForm({ ...form, message: value })} placeholder="Areas served, property types, and experience" multiline theme={theme} />
          <Pressable disabled={saving} onPress={submit} style={[styles.submit, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}><Text style={styles.submitText}>{saving ? 'Submitting…' : 'Submit for approval'}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></Pressable>
        </View> : null}
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, theme }) {
  return <View style={styles.field}><Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.colors.textSecondary} multiline={multiline} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, minHeight: multiline ? 105 : 46 }]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 30, paddingBottom: 60, gap: 16 },
  hero: { borderRadius: 24, padding: 22, gap: 9 },
  heroTitle: { color: '#fff', fontSize: 27, fontWeight: '900' },
  heroCopy: { color: '#FFFFFFCC', fontSize: 14, lineHeight: 20 },
  statusCard: { borderRadius: 18, borderWidth: 1, padding: 17, gap: 6 },
  statusLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  status: { fontSize: 19, fontWeight: '900' },
  statusCopy: { fontSize: 13, lineHeight: 19 },
  notice: { borderRadius: 14, padding: 13 },
  noticeText: { fontSize: 13, lineHeight: 19 },
  formCard: { borderRadius: 20, borderWidth: 1, padding: 17, gap: 14 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '800' },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, textAlignVertical: 'top' },
  submit: { minHeight: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900' },
});
