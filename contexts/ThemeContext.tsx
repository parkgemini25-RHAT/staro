import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, DEFAULT_THEME } from '../utils/cardAssets';

const THEME_STORAGE_KEY = 'starot-theme';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'tangttung' ? 'tangttung' : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  // Design tokens switch via [data-theme] CSS variable overrides
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch { /* storage unavailable — theme just won't persist */ }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
