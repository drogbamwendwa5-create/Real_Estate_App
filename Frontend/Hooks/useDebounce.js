// src/Hooks/useDebounce.js
import { useState, useEffect } from 'react';
/**
 * Returns a debounced value that updates after the specified delay.
 * @param value The value to debounce.
 * @param delayMs Delay in milliseconds.
 */
export default function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);
  return debounced;
}
