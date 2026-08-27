import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Text, Button, TextInput, Card, Divider, Chip, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CreateListingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [amenities, setAmenities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyTypes = ['House', 'Apartment', 'Villa', 'Condo', 'Land', 'Commercial'];
  const availableAmenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Security', 'Elevator', 'Balcony', 'Garden', 'AC', 'Heating'];

  const toggleAmenity = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
            style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Create Listing
            </Text>
            <Paragraph style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              List your property for sale or rent
            </Paragraph>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Property Title
            </Paragraph>
            <TextInput
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Luxury Villa - Runda"
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Price (KSh)
              </Paragraph>
              <TextInput
                mode="outlined"
                value={price}
                onChangeText={setPrice}
                placeholder="25000000"
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Location
              </Paragraph>
              <TextInput
                mode="outlined"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Westlands, Nairobi"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
              Description
            </Paragraph>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your property..."
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Details
          </Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Bedrooms
              </Paragraph>
              <TextInput
                mode="outlined"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Bathrooms
              </Paragraph>
              <TextInput
                mode="outlined"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Paragraph style={[styles.label, { color: theme.colors.textSecondary }]}>
                Area (m2)
              </Paragraph>
              <TextInput
                mode="outlined"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Property Type
          </Text>
          <View style={styles.chipRow}>
            {propertyTypes.map((type) => (
              <Chip
                key={type}
                selected={propertyType === type.toLowerCase()}
                onPress={() => setPropertyType(type.toLowerCase())}
                style={[styles.chip, { backgroundColor: propertyType === type.toLowerCase() ? theme.colors.primary : theme.colors.surface }]}
                textStyle={{ color: propertyType === type.toLowerCase() ? '#FFFFFF' : theme.colors.text }}
              >
                {type}
              </Chip>
            ))}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Amenities
          </Text>
          <View style={styles.chipRow}>
            {availableAmenities.map((amenity) => (
              <Chip
                key={amenity}
                selected={amenities.includes(amenity)}
                onPress={() => toggleAmenity(amenity)}
                style={[styles.chip, { backgroundColor: amenities.includes(amenity) ? theme.colors.primary : theme.colors.surface }]}
                textStyle={{ color: amenities.includes(amenity) ? '#FFFFFF' : theme.colors.text }}
              >
                {amenity}
              </Chip>
            ))}
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Listing
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
  },
  submitButton: {
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 16,
  },
});