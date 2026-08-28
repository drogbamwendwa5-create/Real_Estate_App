import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createProperty } from '../../Services/api';
import { useTheme } from '../../Context/ThemeContext';

export default function CreatePropertyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: 'apartment',
    bedrooms: '0', bathrooms: '0', area: '0', street: '', city: '',
  });

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) setImages(current => [...current, ...result.assets]);
  };

  const onSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.price || !form.city.trim()) {
      Alert.alert('Complete your listing', 'Add a title, description, price, and city.');
      return;
    }
    setLoading(true);
    try {
      const normalizedType = ['villa', 'condo'].includes(form.propertyType) ? 'house' : form.propertyType;
      await createProperty({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        status: 'for-sale',
        propertyType: normalizedType,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area: Number(form.area) || 0,
        address: { street: form.street.trim(), city: form.city.trim(), country: 'Kenya' },
      });
      Alert.alert('Draft saved', 'Your listing is saved and ready for verification.');
      router.replace('/property/my-listings');
    } catch (error) {
      Alert.alert('Could not save listing', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <TouchableOpacity
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
        style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create listing</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Save a complete draft now, then submit it for verification.</Text>
      <TextInput label="Title *" value={form.title} onChangeText={value => update('title', value)} mode="outlined" style={styles.input} />
      <TextInput label="Description *" value={form.description} onChangeText={value => update('description', value)} mode="outlined" multiline numberOfLines={5} style={styles.input} />
      <View style={styles.row}>
        <TextInput label="Price (KES) *" value={form.price} onChangeText={value => update('price', value)} keyboardType="numeric" mode="outlined" style={[styles.input, styles.half]} />
      </View>
      <View style={styles.typeRow}>
        <Text style={[styles.typeLabel, { color: theme.colors.text }]}>Property type *</Text>
        <View style={styles.typeChips}>
          {['apartment', 'house', 'land', 'commercial'].map(type => {
            const active = form.propertyType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => update('propertyType', type)}
                style={[styles.typeChip, active && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              >
                <Text style={[styles.typeChipText, { color: theme.colors.text }, active && { color: '#fff' }]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.row}>
        <TextInput label="Bedrooms" value={form.bedrooms} onChangeText={value => update('bedrooms', value)} keyboardType="numeric" mode="outlined" style={[styles.input, styles.third]} />
        <TextInput label="Bathrooms" value={form.bathrooms} onChangeText={value => update('bathrooms', value)} keyboardType="numeric" mode="outlined" style={[styles.input, styles.third]} />
        <TextInput label="Area" value={form.area} onChangeText={value => update('area', value)} keyboardType="numeric" mode="outlined" style={[styles.input, styles.third]} />
      </View>
      <TextInput label="Street" value={form.street} onChangeText={value => update('street', value)} mode="outlined" style={styles.input} />
      <TextInput label="City *" value={form.city} onChangeText={value => update('city', value)} mode="outlined" style={styles.input} />
      <HelperText type="info">Images selected: {images.length}. Add them after the draft is created.</HelperText>
      <Button mode="outlined" icon="image-multiple-outline" onPress={pickImage}>Choose images</Button>
      <Button mode="contained" loading={loading} disabled={loading} onPress={onSubmit} style={styles.submit}>Save draft</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 12, paddingBottom: 50 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  input: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  third: { flex: 1, minWidth: 0 },
  typeRow: { gap: 8, marginBottom: 2 },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.4)',
  },
  typeChipText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  submit: { marginTop: 8, borderRadius: 12, paddingVertical: 5 },
});