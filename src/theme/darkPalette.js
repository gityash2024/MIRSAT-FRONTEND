/**
 * Dark palette for the web portal.
 *
 * Mirrors the mobile app's dark tokens (mirsat-mobile/src/constants/theme.js)
 * so the inspector sees the same near-black surfaces and light text on both
 * apps. The brand navy is brightened so primary buttons still stand out on
 * black while white text on them stays above 4.5:1 contrast. Gold is the
 * accent for active / selected states, as in the mobile app.
 */
export const DARK_PALETTE = {
  background: '#090909',
  backgroundLight: '#111111',
  surface: '#171717',
  surfaceRaised: '#222222',
  surfaceInset: '#0d0d0d',
  border: '#333333',
  borderLight: '#404040',
  textPrimary: '#fafafa',
  textSecondary: '#d4d4d8',
  textTertiary: '#b1b4be',
  gold: '#f5c451',
  success: '#22c55e',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  navy: '#2b4c9b',
  navyDark: '#1f3877',
  navyText: '#9db4f5',
  navyBorder: '#4c6fc4',
  goldSoft: 'rgba(245, 196, 81, 0.14)',
  goldBorder: 'rgba(245, 196, 81, 0.55)',
};

export default DARK_PALETTE;
