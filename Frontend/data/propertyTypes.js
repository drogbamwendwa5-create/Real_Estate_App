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
  'Air Conditioning', 'Heating', 'Laundry', 'Storage',
];

export const FEATURES = [
  'Modern Kitchen', 'Hardwood Floors', 'High Ceilings',
  'City View', 'Water View', 'Mountain View', 'Fireplace',
  'Solar Panels', 'Smart Home', 'Jacuzzi',
];

export const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
];

export const PRICE_RANGES = [
  { id: '1', label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { id: '2', label: '$100,000 - $250,000', min: 100000, max: 250000 },
  { id: '3', label: '$250,000 - $500,000', min: 250000, max: 500000 },
  { id: '4', label: '$500,000 - $1,000,000', min: 500000, max: 1000000 },
  { id: '5', label: '$1,000,000+', min: 1000000, max: null },
];