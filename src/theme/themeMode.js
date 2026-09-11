import { buildInlineOverrideCss } from './inlineStyleOverrides';

export const THEME_STORAGE_KEY = 'mirsat_theme_mode';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

const INLINE_OVERRIDES_STYLE_ID = 'mirsat-dark-inline-overrides';

/** The saved choice for this browser; light unless the user picked dark. */
export function readStoredThemeMode() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === THEME_MODES.DARK
      ? THEME_MODES.DARK
      : THEME_MODES.LIGHT;
  } catch {
    return THEME_MODES.LIGHT;
  }
}

export function storeThemeMode(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage blocked (private mode / policy): the choice lasts for this page only.
  }
}

function ensureInlineOverrides() {
  if (document.getElementById(INLINE_OVERRIDES_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INLINE_OVERRIDES_STYLE_ID;
  style.textContent = buildInlineOverrideCss(document);
  document.head.appendChild(style);
}

/**
 * Marks <html> for the dark theme. Light mode removes the marker entirely so
 * the document is exactly what it was before dark mode existed.
 */
export function applyDocumentTheme(mode) {
  const root = document.documentElement;
  if (mode === THEME_MODES.DARK) {
    ensureInlineOverrides();
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.removeAttribute('data-theme');
    root.style.removeProperty('color-scheme');
  }
}
