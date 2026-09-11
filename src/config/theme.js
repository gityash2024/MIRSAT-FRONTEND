import { createTheme } from '@mui/material/styles';
import { DARK_PALETTE } from '../theme/darkPalette';

// Define the color palette based on client requirements
const colors = {
  primary: {
    main: '#000048', // Deep Navy Blue
    light: '#4B8C9E', // Soft Teal
    dark: '#000030', // Darker Navy Blue for hovering
  },
  secondary: {
    main: '#4B8C9E', // Soft Teal
    light: '#A9CDCE', // Light Seafoam
    dark: '#2D4654', // Dark Slate
  },
  background: {
    default: '#F7F9FA', // Off-White
    paper: '#F7F9FA', // Off-White
    card: '#E3D9CA', // Sand Beige
    alt: '#D6E5EA', // Pale Sky Blue
  },
  text: {
    primary: '#2D4654', // Dark Slate
    secondary: '#8CA3B7', // Medium Gray
  },
  divider: '#E2E8ED', // Light Gray
  status: {
    success: '#7CB797', // Muted Green
    warning: '#DFBE7F', // Soft Amber
    error: '#dc2434', // Subdued Red
    info: '#7CA7C8', // Gentle Blue
    alert: '#E99B83', // Muted Coral
  },
  // Status for compliance levels
  compliance: {
    full: '#7CB797', // Success - Full compliance
    partial: '#DFBE7F', // Warning - Partial compliance
    non: '#dc2434', // Error - Non-compliance
    na: '#8CA3B7', // Medium Gray - Not applicable
  }
};

// This object maps CSS variable names to their color values
// to ensure consistency between MUI theme and CSS variables
export const cssVariables = {
  '--color-navy': colors.primary.main,
  '--color-navy-dark': colors.primary.dark,
  '--color-teal': colors.secondary.main,
  '--color-seafoam': colors.secondary.light,
  
  '--color-sand': colors.background.card,
  '--color-coral': colors.status.alert,
  '--color-skyblue': colors.background.alt,
  
  '--color-offwhite': colors.background.default,
  '--color-gray-light': colors.divider,
  '--color-gray-medium': colors.text.secondary,
  '--color-gray-dark': colors.text.primary,
  
  '--color-success': colors.status.success,
  '--color-warning': colors.status.warning,
  '--color-error': colors.status.error,
  '--color-info': colors.status.info,
  
  '--color-compliance-full': colors.compliance.full,
  '--color-compliance-partial': colors.compliance.partial,
  '--color-compliance-non': colors.compliance.non,
  '--color-compliance-na': colors.compliance.na,
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: '#ffffff',
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    divider: colors.divider,
    error: {
      main: colors.status.error,
    },
    warning: {
      main: colors.status.warning,
    },
    info: {
      main: colors.status.info,
    },
    success: {
      main: colors.status.success,
    },
  },
  typography: {
    fontFamily: '"_thesansarab_9750fc", "_thesansarab_Fallback_9750fc", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      color: colors.text.primary,
      fontWeight: 700,
    },
    h2: {
      color: colors.text.primary,
      fontWeight: 600,
    },
    h3: {
      color: colors.text.primary,
      fontWeight: 600,
    },
    h4: {
      color: colors.text.primary,
      fontWeight: 600,
    },
    h5: {
      color: colors.text.primary,
      fontWeight: 600,
    },
    h6: {
      color: colors.text.primary,
      fontWeight: 600,
    },
    body1: {
      color: colors.text.primary,
    },
    body2: {
      color: colors.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary.main,
          '&:hover': {
            backgroundColor: colors.secondary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.card,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: colors.divider,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
  // Export the raw colors for use in styled-components
  customColors: colors,
});

// Dark variant for the MUI screens. styled-components get their dark colors
// from src/theme/stylisDarkPlugin.js instead.
export const darkTheme = createTheme(theme, {
  palette: {
    mode: 'dark',
    primary: {
      main: DARK_PALETTE.navy,
      light: DARK_PALETTE.navyBorder,
      dark: DARK_PALETTE.navyDark,
      contrastText: '#ffffff',
    },
    background: {
      default: DARK_PALETTE.background,
      paper: DARK_PALETTE.surface,
    },
    text: {
      primary: DARK_PALETTE.textPrimary,
      secondary: DARK_PALETTE.textTertiary,
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: DARK_PALETTE.border,
    action: {
      active: DARK_PALETTE.textSecondary,
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      focus: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    h1: { color: DARK_PALETTE.textPrimary },
    h2: { color: DARK_PALETTE.textPrimary },
    h3: { color: DARK_PALETTE.textPrimary },
    h4: { color: DARK_PALETTE.textPrimary },
    h5: { color: DARK_PALETTE.textPrimary },
    h6: { color: DARK_PALETTE.textPrimary },
    body1: { color: DARK_PALETTE.textPrimary },
    body2: { color: DARK_PALETTE.textTertiary },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: DARK_PALETTE.navy,
          '&:hover': {
            backgroundColor: DARK_PALETTE.navyDark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_PALETTE.surface,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_PALETTE.surface,
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_PALETTE.border,
        },
      },
    },
  },
});

export default theme;