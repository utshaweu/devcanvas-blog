import { Theme, ThemeContextType } from '@/types';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'devcanvas-theme';

const getSystemTheme = () => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      return stored ?? 'system';
    } catch {
      return 'system';
    }
  });

  const computeEffective = useCallback((t: Theme) => (t === 'system' ? getSystemTheme() : (t === 'dark' ? 'dark' : 'light')), []);

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => computeEffective(theme));

  // apply theme to html element whenever theme or system preference changes
  useEffect(() => {
    const apply = () => {
      const applied = computeEffective(theme);
      setEffectiveTheme(applied);
      document.documentElement.classList.toggle('dark', applied === 'dark');
    };

    apply();

    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleMq = () => {
      if (theme === 'system') apply();
    };

    if (mq) {
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleMq);
      } else {
        // Fallback for older browsers: use onchange property 
        (mq as MediaQueryList).onchange = handleMq;
      }
    }

    return () => {
      if (mq) {
        if (typeof mq.removeEventListener === 'function') {
          mq.removeEventListener('change', handleMq);
        } else {
          (mq as MediaQueryList).onchange = null;
        }
      }
    };
  }, [theme, computeEffective]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeProvider;
