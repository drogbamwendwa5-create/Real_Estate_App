export const mockProperties = [
  {
    _id: '1',
    title: 'Luxury 3 Bedroom Apartment',
    description: 'Beautiful apartment in downtown with modern amenities and city views.',
    price: 250000,
    currency: 'USD',
    propertyType: 'apartment',
    status: 'for-sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1500,
    lotSize: 0,
    yearBuilt: 2020,
    address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
    location: { type: 'Point', coordinates: [-73.935242, 40.73061] },
    images: [{ url: 'https://via.placeholder.com/400x300', publicId: '1', isFeatured: true }],
    features: ['Modern Kitchen', 'Balcony', 'City View'],
    amenities: ['Pool', 'Gym', 'Parking'],
    agent: '507f1f77bcf86cd799439011',
    isFeatured: true,
    isPublished: true,
    views: 120,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Modern Family House',
    description: 'Spacious family house with garden and garage in quiet neighborhood.',
    price: 450000,
    currency: 'USD',
    propertyType: 'house',
    status: 'for-sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    lotSize: 5000,
    yearBuilt: 2018,
    address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90001', country: 'US' },
    location: { type: 'Point', coordinates: [-118.243683, 34.052235] },
    images: [{ url: 'https://via.placeholder.com/400x300', publicId: '2', isFeatured: true }],
    features: ['Garden', 'Garage', 'Fireplace'],
    amenities: ['Security', 'Wifi', 'Laundry'],
    agent: '507f1f77bcf86cd799439011',
    isFeatured: true,
    isPublished: true,
    views: 85,
    createdAt: new Date().toISOString(),
  },
];

export const mockUsers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', role: 'user' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', role: 'agent' },
];

export const mockConversations = [
  {
    _id: '1',
    participants: [{ _id: '1', name: 'John Doe' }, { _id: '2', name: 'Jane Smith' }],
    lastMessage: { text: 'Is the property still available?', sender: '1', createdAt: new Date().toISOString() },
    isActive: true,
  },
];

export const mockNotifications = [
  {
    _id: '1',
    recipient: '1',
    sender: '2',
    type: 'property',
    title: 'New Property Listed',
    message: 'A new property matching your criteria has been listed.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];