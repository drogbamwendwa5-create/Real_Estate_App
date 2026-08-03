import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Create listing</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Save a complete draft now, then submit it for verification.</Text>
      <TextInput label="Title *" value={form.title} onChangeText={value => update('title', value)} mode="outlined" style={styles.input} />
      <TextInput label="Description *" value={form.description} onChangeText={value => update('description', value)} mode="outlined" multiline numberOfLines={5} style={styles.input} />
      <View style={styles.row}>
        <TextInput label="Price (KES) *" value={form.price} onChangeText={value => update('price', value)} keyboardType="numeric" mode="outlined" style={[styles.input, styles.half]} />
        <TextInput label="Property type" value={form.propertyType} onChangeText={value => update('propertyType', value.toLowerCase())} mode="outlined" style={[styles.input, styles.half]} />
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
  title: { fontSize: 30, fontWeight: '900' },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  input: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  third: { flex: 1, minWidth: 0 },
  submit: { marginTop: 8, borderRadius: 12, paddingVertical: 5 },
});