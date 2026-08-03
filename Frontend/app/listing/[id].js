import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, Card, Divider, Chip, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = {
          id: id,
          title: 'Luxury Villa with Pool - Runda',
          price: 85000000,
          location: 'Runda, Nairobi',
          description: 'Stunning luxury villa in Runda with panoramic views, private pool, and world-class amenities.',
          bedrooms: 5,
          bathrooms: 4,
          area: 450,
          propertyType: 'villa',
          amenities: ['WiFi', 'Pool', 'Gym', 'Security', 'Parking', 'Generator', 'Water Tank'],
          status: 'active',
          views: 234,
          inquiries: 12,
        };
        setListing(data);
        setTitle(data.title);
        setPrice(String(data.price));
        setLocation(data.location);
        setDescription(data.description);
        setBedrooms(String(data.bedrooms));
        setBathrooms(String(data.bathrooms));
        setArea(String(data.area));
        setPropertyType(data.propertyType);
        setAmenities(data.amenities);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Listing not found</Text>
        <Button mode="contained" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}>Go Back</Button>
      </View>
    );
  }

  const propertyTypes = ['House', 'Apartment', 'Villa', 'Condo', 'Land', 'Commercial'];
  const availableAmenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Security', 'Elevator', 'Balcony', 'Garden', 'AC', 'Heating'];

  const toggleAmenity = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSave = async () => {
    // TODO: Wire to backend
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isEditing ? 'Edit Listing' : 'Listing Details'}
          </Text>
          {!isEditing && (
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: theme.colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Icon name="pencil" size={16} color={theme.colors.primary} />
              <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditing && (
          <View style={styles.statsRow}>
            <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Icon name="eye" size={20} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{listing.views}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Views</Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Icon name="mail" size={20} color={theme.colors.success} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{listing.inquiries}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Inquiries</Text>
            </Surface>
            <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>Active</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Status</Text>
            </Surface>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Property Title</Text>
            <TextInput
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              editable={isEditing}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Price (KSh)</Text>
              <TextInput
                mode="outlined"
                value={price}
                onChangeText={setPrice}
                editable={isEditing}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location</Text>
              <TextInput
                mode="outlined"
                value={location}
                onChangeText={setLocation}
                editable={isEditing}
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description</Text>
            <TextInput
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              editable={isEditing}
              multiline
              numberOfLines={3}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineColor={theme.colors.border}
              activeOutlineColor={theme.colors.primary}
            />
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bedrooms</Text>
              <TextInput
                mode="outlined"
                value={bedrooms}
                onChangeText={setBedrooms}
                editable={isEditing}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bathrooms</Text>
              <TextInput
                mode="outlined"
                value={bathrooms}
                onChangeText={setBathrooms}
                editable={isEditing}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Area (m2)</Text>
              <TextInput
                mode="outlined"
                value={area}
                onChangeText={setArea}
                editable={isEditing}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                outlineColor={theme.colors.border}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </View>

          {isEditing && (
            <>
              <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Property Type</Text>
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

              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Amenities</Text>
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
            </>
          )}

          {isEditing && (
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditing(false)}
                style={[styles.button, { borderColor: theme.colors.border }]}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSave}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
              >
                Save Changes
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 12,
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
});