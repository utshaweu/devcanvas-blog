import { useEffect, useState } from 'react';

export type FontFamilyPreference = 'inter' | 'acme';

const FONT_FAMILY_STORAGE_KEY = 'devcanvas-font-family';

export const useFontFamily = () => {
  const [fontFamily, setFontFamily] = useState<FontFamilyPreference>(() => {
    try {
      const stored = localStorage.getItem(FONT_FAMILY_STORAGE_KEY) as FontFamilyPreference | null;
      return stored === 'acme' ? 'acme' : 'inter';
    } catch {
      return 'inter';
    }
  });

  useEffect(() => {
    const isAcme = fontFamily === 'acme';
    document.documentElement.classList.toggle('font-acme', isAcme);

    try {
      localStorage.setItem(FONT_FAMILY_STORAGE_KEY, fontFamily);
    } catch {
      // ignore
    }
  }, [fontFamily]);

  const toggleFontFamily = () => {
    setFontFamily((prev) => (prev === 'inter' ? 'acme' : 'inter'));
  };

  return {
    fontFamily,
    toggleFontFamily,
  };
};
