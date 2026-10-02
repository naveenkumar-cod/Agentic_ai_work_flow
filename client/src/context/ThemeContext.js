import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setLocalTheme] = useState('system');
  const [systemIsDark, setSystemIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Read stored theme from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agentflow_theme');
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setLocalTheme(stored);
      }
    } catch (_) {}

    // Check system preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(mediaQuery.matches);

      const handleChange = (e) => {
        setSystemIsDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      setMounted(true);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'agentflow_theme' && e.newValue && ['light', 'dark', 'system'].includes(e.newValue)) {
        setLocalTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Determine actual active theme (light or dark)
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemIsDark]);

  // Apply 'dark' class to <html> whenever resolvedTheme changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) return;
    setLocalTheme(newTheme);
    try {
      localStorage.setItem('agentflow_theme', newTheme);
    } catch (_) {}
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      mounted,
    }),
    [theme, resolvedTheme, setTheme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
