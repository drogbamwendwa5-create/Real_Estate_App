export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^\+?[\d\s()-]{10,20}$/.test(phone);
};

export const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
