/**
 * Property Aggregation System - Property Configuration
 *
 * Central configuration for property data normalisation, supported types,
 * listing types, currencies, and Kenyan geographic data.
 */
module.exports = {
  // Supported property types (normalised across all sources)
  propertyTypes: [
    'apartment',
    'house',
    'villa',
    'maisonette',
    'bungalow',
    'townhouse',
    'studio',
    'penthouse',
    'land',
    'commercial',
    'office',
    'warehouse',
    'shop',
    'industrial',
    'farm',
    'mixed-use',
  ],

  // Listing types
  listingTypes: ['for-sale', 'for-rent', 'sold', 'rented'],

  // Supported currencies
  currencies: ['KES', 'USD', 'EUR', 'GBP'],

  // Default currency for Kenyan market
  defaultCurrency: 'KES',

  // Kenyan counties (all 47)
  counties: [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Kiambu',
    'Nakuru',
    'Eldoret',
    'Uasin Gishu',
    'Nyeri',
    'Machakos',
    'Kajiado',
    'Kilifi',
    'Malindi',
    'Lamu',
    'Tana River',
    'Garissa',
    'Wajir',
    'Mandera',
    'Marsabit',
    'Isiolo',
    'Meru',
    'Tharaka-Nithi',
    'Embu',
    'Kitui',
    'Makueni',
    'Nyandarua',
    'Laikipia',
    'Murang\'a',
    'Kirinyaga',
    'West Pokot',
    'Trans Nzoia',
    'Bungoma',
    'Busia',
    'Kakamega',
    'Vihiga',
    'Bomet',
    'Kericho',
    'Narok',
    'Baringo',
    'Samburu',
    'Turkana',
    'Elgeyo-Marakwet',
    'Nandi',
    'Homa Bay',
    'Migori',
    'Kisii',
    'Nyamira',
    'Kwale',
    'Taita-Taveta',
  ],

  // Major towns per county (subset for geolocation fallback)
  majorTowns: {
    Nairobi: ['Westlands', 'Karen', 'Lavington', 'Runda', 'Kilimani', 'Kileleshwa', 'Parklands', 'Embakasi', 'Kasarani', 'Ruaka', 'Ngong Road', 'Langata', 'South B', 'South C', 'Buruburu', 'Donholm'],
    Mombasa: ['Nyali', 'Bamburi', 'Shanzu', 'Likoni', 'Mtwapa', 'Tudor', 'Tremor'],
    Kisumu: ['Milimani', 'Tom Mboya Estate', 'Nyalenda', 'Mamboleo'],
    Kiambu: ['Ruiru', 'Juja', 'Thika', 'Limuru', 'Kikuyu', 'Kiambu Town', 'Karuri', 'Githunguri'],
    Nakuru: ['Milimani', 'Section 58', 'Lanet', 'Njoro', 'Naivasha', 'Gilgil'],
  },

  // Availability statuses
  availabilityStatuses: ['available', 'under-offer', 'sold', 'rented', 'inactive', 'expired'],

  // Verification statuses
  verificationStatuses: ['pending', 'verified', 'rejected', 'ai-flagged'],

  // Price ranges for validation (KES)
  priceRanges: {
    'for-rent': { min: 5000, max: 50000000 },
    'for-sale': { min: 500000, max: 5000000000 },
  },

  // Maximum number of images per property
  maxImages: 50,

  // Maximum number of videos per property
  maxVideos: 10,

  // Batch size for incremental updates
  batchSize: 100,

  // Maximum description length
  maxDescriptionLength: 10000,

  // Maximum title length
  maxTitleLength: 200,
};