import React, { createContext, useContext, useMemo, useState } from 'react';
import { CombinedDarkTheme, CombinedLightTheme } from '@/constants/theme';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  theme: typeof CombinedLightTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const theme = useMemo(
    () => (isDark ? CombinedDarkTheme : CombinedLightTheme),
    [isDark],
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}
