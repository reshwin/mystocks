import { useState, useEffect } from 'react';

// Like useState, but persists the value in sessionStorage under `key` so it
// survives navigating away and back (cleared when the browser tab closes).
export default function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch { /* storage unavailable — ignore */ }
  }, [key, value]);

  return [value, setValue];
}
