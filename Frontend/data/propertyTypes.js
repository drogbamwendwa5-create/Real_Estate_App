export const PROPERTY_TYPES = [
  { id: 'apartment', name: 'Apartment', icon: 'apartment' },
  { id: 'house', name: 'House', icon: 'home' },
  { id: 'land', name: 'Land', icon: 'map' },
  { id: 'commercial', name: 'Commercial', icon: 'office-building' },
];

export const PROPERTY_STATUS = [
  { id: 'for-sale', name: 'For Sale', label: 'For Sale' },
  { id: 'for-rent', name: 'For Rent', label: 'For Rent' },
  { id: 'sold', name: 'Sold', label: 'Sold' },
  { id: 'rented', name: 'Rented', label: 'Rented' },
];

export const AMENITIES = [
  'Pool', 'Gym', 'Parking', 'Garden', 'Security',
  'Elevator', 'Balcony', 'Terrace', 'Garage', 'Wifi',
  'Air Conditioning', 'Water Tank', 'Generator', 'Solar',
  'Borehole', 'CCTV', 'Electric Fence', 'Servant Quarters',
];

export const FEATURES = [
  'Modern Kitchen', 'Tiled Floors', 'High Ceilings',
  'City View', 'Mountain View', 'Garden View', 'Fireplace',
  'Solar Panels', 'Smart Home', 'Jacuzzi',
  'Rooftop Terrace', 'En-suite Bedrooms', 'Walk-in Closet',
  'DSQ (Domestic Servant Quarters)', 'Carport',
];

export const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
];

export const PRICE_RANGES = [
  { id: '1', label: 'KSh 1M - KSh 5M', min: 1000000, max: 5000000 },
  { id: '2', label: 'KSh 5M - KSh 10M', min: 5000000, max: 10000000 },
  { id: '3', label: 'KSh 10M - KSh 25M', min: 10000000, max: 25000000 },
  { id: '4', label: 'KSh 25M - KSh 50M', min: 25000000, max: 50000000 },
  { id: '5', label: 'KSh 50M+', min: 50000000, max: null },
];