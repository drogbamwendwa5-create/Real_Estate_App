import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { createProperty } from '../Services/api';
import { useAuth } from '../Hooks/useAuth';

const { width } = Dimensions.get('window');

const CreatePropertyScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: 'apartment',
    status: 'for-sale',
    bedrooms: '',
    bathrooms: '',
    area: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    features: '',
    amenities: '',
  });

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const statusOptions = [
    { value: 'for-sale', label: 'For Sale' },
    { value: 'for-rent', label: 'For Rent' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || !formData.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        status: formData.status,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country || 'Kenya',
        },
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        images: images.map(img => ({ url: img.uri, isFeatured: false })),
      };

      await createProperty(propertyData);
      Alert.alert('Success', 'Property created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Property</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Property Title *"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={styles.input}
            placeholder="Price *"
            value={formData.price}
            onChangeText={(text) => updateFormData('price', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                {propertyTypes.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.optionButton, formData.propertyType === type.value && styles.optionButtonActive]}
                    onPress={() => updateFormData('propertyType', type.value)}
                  >
                    <Text style={[styles.optionText, formData.propertyType === type.value && styles.optionTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                {statusOptions.map(status => (
                  <TouchableOpacity
                    key={status.value}
                    style={[styles.optionButton, formData.status === status.value && styles.optionButtonActive]}
                    onPress={() => updateFormData('status', status.value)}
                  >
                    <Text style={[styles.optionText, formData.status === status.value && styles.optionTextActive]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                style={styles.input}
                placeholder="Bedrooms"
                value={formData.bedrooms}
                onChangeText={(text) => updateFormData('bedrooms', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <TextInput
                style={styles.input}
                placeholder="Bathrooms"
                value={formData.bathrooms}
                onChangeText={(text) => updateFormData('bathrooms', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Area (sqft)"
            value={formData.area}
            onChangeText={(text) => updateFormData('area', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.street}
            onChangeText={(text) => updateFormData('street', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="City *"
            value={formData.city}
            onChangeText={(text) => updateFormData('city', text)}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>
            <View style={styles.halfInput}>
              <TextInput
                style={styles.input}
                placeholder="Zip Code"
                value={formData.zipCode}
                onChangeText={(text) => updateFormData('zipCode', text)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Ionicons name="add" size={32} color="#007AFF" />
              <Text style={styles.imagePickerText}>Add Images</Text>
            </TouchableOpacity>
            {images.map((image, index) => (
              <Image key={index} source={{ uri: image.uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Property'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePropertyScreen;
