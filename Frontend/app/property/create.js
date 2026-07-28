import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePropertyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    // TODO: Create property with images
    console.log({ ...data, images });
    setLoading(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Listing</Text>
      <TextInput label="Title *" control={control} name="title" defaultValue="" rules={{ required: 'Title is required' }} error={!!errors.title} />
      {errors.title && <HelperText type="error">{errors.title.message}</HelperText>}

      <TextInput label="Description *" control={control} name="description" defaultValue="" multiline numberOfLines={4} rules={{ required: 'Description is required' }} error={!!errors.description} />
      {errors.description && <HelperText type="error">{errors.description.message}</HelperText>}

      <TextInput label="Price *" control={control} name="price" defaultValue="" keyboardType="numeric" rules={{ required: 'Price is required' }} error={!!errors.price} />
      {errors.price && <HelperText type="error">{errors.price.message}</HelperText>}

      <TextInput label="Property Type" control={control} name="propertyType" defaultValue="apartment" />
      <TextInput label="Bedrooms" control={control} name="bedrooms" defaultValue="0" keyboardType="numeric" />
      <TextInput label="Bathrooms" control={control} name="bathrooms" defaultValue="0" keyboardType="numeric" />
      <TextInput label="Area (sqft)" control={control} name="area" defaultValue="0" keyboardType="numeric" />

      <TextInput label="Street" control={control} name="street" defaultValue="" />
      <TextInput label="City *" control={control} name="city" defaultValue="" rules={{ required: 'City is required' }} error={!!errors.city} />
      {errors.city && <HelperText type="error">{errors.city.message}</HelperText>}

      <Button mode="outlined" onPress={pickImage}>Pick Images ({images.length})</Button>
      <Button mode="contained" style={styles.button} onPress={handleSubmit(onSubmit)} loading={loading}>
        Create Listing
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { marginTop: 16, paddingVertical: 8 },
});