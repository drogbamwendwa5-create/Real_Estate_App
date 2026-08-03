export const formatPrice = (price, currency = 'KES') => {
  if (price === undefined || price === null || isNaN(price)) return 'KSh 0';
  if (currency === 'KES') {
    return `KSh ${Number(price).toLocaleString('en-KE')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatLocation = (location, address) => {
  if (!location && !address) return 'Nairobi, Kenya';
  if (typeof location === 'string') return location;
  if (typeof address === 'string') return address;
  if (address && typeof address === 'object') {
    const parts = [address.street, address.city, address.county, address.state, address.country].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  if (location && typeof location === 'object') {
    if (location.formattedAddress) return location.formattedAddress;
    if (location.city) return `${location.street ? location.street + ', ' : ''}${location.city}`;
    if (location.type === 'Point' && Array.isArray(location.coordinates)) {
      return `Lat: ${location.coordinates[1]?.toFixed(4)}, Lng: ${location.coordinates[0]?.toFixed(4)}`;
    }
  }
  return 'Nairobi, Kenya';
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};