import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  THEME_MODES,
  THEME_STORAGE_KEY,
  applyDocumentTheme,
  readStoredThemeMode,
  storeThemeMode,
} from '../theme/themeMode';

const ThemeModeContext = createContext({
  mode: THEME_MODES.LIGHT,
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(readStoredThemeMode);

  // Before paint, so the dark classes and the <html> marker land together.
  useLayoutEffect(() => {
    applyDocumentTheme(mode);
  }, [mode]);

  // Keep other open tabs of the portal on the same theme.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) setMode(readStoredThemeMode());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setThemeMode = useCallback((nextMode) => {
    if (nextMode !== THEME_MODES.LIGHT && nextMode !== THEME_MODES.DARK) return;
    storeThemeMode(nextMode);
    setMode(nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  }, [mode, setThemeMode]);

  const value = useMemo(() => ({
    mode,
    isDark: mode === THEME_MODES.DARK,
    setThemeMode,
    toggleTheme,
  }), [mode, setThemeMode, toggleTheme]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeModeContext);
