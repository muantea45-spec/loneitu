import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'loneitu_sunlight_mode';
const EVENT_NAME = 'loneitu-sunlight-change';

export function getSunlightModeFromStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useSunlightMode() {
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const active = getSunlightModeFromStorage();
    if (active) {
      document.documentElement.classList.add('sunlight-mode');
    } else {
      document.documentElement.classList.remove('sunlight-mode');
    }
    return active;
  });

  useEffect(() => {
    const handleSunlightChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setIsSunlightMode(customEvent.detail.enabled);
    };

    window.addEventListener(EVENT_NAME, handleSunlightChange);
    return () => window.removeEventListener(EVENT_NAME, handleSunlightChange);
  }, []);

  const toggleSunlightMode = useCallback(() => {
    setIsSunlightMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
      } catch (err) {
        console.error('Failed to save sunlight mode preference', err);
      }

      if (next) {
        document.documentElement.classList.add('sunlight-mode');
      } else {
        document.documentElement.classList.remove('sunlight-mode');
      }

      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, { detail: { enabled: next } })
      );

      return next;
    });
  }, []);

  return { isSunlightMode, toggleSunlightMode };
}

