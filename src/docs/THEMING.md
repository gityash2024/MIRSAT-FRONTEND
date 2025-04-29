# MIRSAT Frontend Theming Guide

This guide explains how to implement consistent styling across the MIRSAT application using our custom theme.

## Color Palette

The application uses the following color palette, which is defined as CSS variables in `index.css` and applied consistently through our theming system:

### Primary Colors
- **Deep Navy Blue** (`--color-navy`: #1A3A5F) - Use for headers and primary buttons
- **Soft Teal** (`--color-teal`: #4B8C9E) - Use for secondary elements and highlights
- **Light Seafoam** (`--color-seafoam`: #A9CDCE) - Use for backgrounds and panels

### Secondary Colors
- **Sand Beige** (`--color-sand`: #E3D9CA) - Use for cards and content areas
- **Muted Coral** (`--color-coral`: #E99B83) - Use for alerts and important notifications
- **Pale Sky Blue** (`--color-skyblue`: #D6E5EA) - Use for alternate sections and hover states

### Neutrals
- **Off-White** (`--color-offwhite`: #F7F9FA) - Use for main backgrounds
- **Light Gray** (`--color-gray-light`: #E2E8ED) - Use for borders and dividers
- **Medium Gray** (`--color-gray-medium`: #8CA3B7) - Use for secondary text
- **Dark Slate** (`--color-gray-dark`: #2D4654) - Use for primary text

### Status Colors
- **Success** (`--color-success`: #7CB797) - A muted green for success states
- **Warning** (`--color-warning`: #DFBE7F) - A soft amber for warning states
- **Error** (`--color-error`: #D18C92) - A subdued red for error states
- **Info** (`--color-info`: #7CA7C8) - A gentle blue for informational states

### Compliance Levels
- **Full Compliance** (`--color-compliance-full`: #7CB797) - Same as success
- **Partial Compliance** (`--color-compliance-partial`: #DFBE7F) - Same as warning
- **Non-Compliance** (`--color-compliance-non`: #D18C92) - Same as error
- **Not Applicable** (`--color-compliance-na`: #8CA3B7) - Same as medium gray

## Using Theme Colors in Components

### Method 1: CSS Variables (Recommended)

Always use CSS variables in your styled components:

```jsx
const Button = styled.button`
  background-color: var(--color-navy);
  color: white;
  
  &:hover {
    background-color: var(--color-navy-dark);
  }
`;
```

### Method 2: Theme Utils

For more complex theming, use the utilities from `themeUtils.js`:

```jsx
import { themeColors, getStatusColor } from '../utils/themeUtils';

const StatusBadge = styled.div`
  background-color: ${props => getStatusColor(props.status)};
  color: white;
`;
```

### Method 3: MUI Theme Provider

When using Material-UI components, they will automatically use the theme:

```jsx
import { Button } from '@mui/material';

function MyComponent() {
  return (
    <Button variant="contained" color="primary">
      Submit
    </Button>
  );
}
```

## Component Guidelines

### Buttons

- **Primary Actions**: Use Navy (`--color-navy`) for primary actions
- **Secondary Actions**: Use white background with Navy text for secondary actions
- **Destructive Actions**: Use Error color (`--color-error`) for destructive actions
- **Hover States**: Use darker version of the button color (e.g., `--color-navy-dark`)

### Forms

- **Input Fields**: Use white background with Light Gray (`--color-gray-light`) borders
- **Focus States**: Use Teal (`--color-teal`) for focus indicators
- **Labels**: Use Dark Slate (`--color-gray-dark`) for labels
- **Helper Text**: Use Medium Gray (`--color-gray-medium`) for helper/hint text
- **Error States**: Use Error color (`--color-error`) for validation errors

### Tables

- **Headers**: Use Off-White (`--color-offwhite`) background with Dark Slate text
- **Rows**: Use white background with Light Gray borders
- **Hover State**: Use Off-White (`--color-offwhite`) or Sky Blue (`--color-skyblue`) for row hover
- **Status Indicators**: Use appropriate status colors for status badges

### Cards

- **Background**: Use white or Sand (`--color-sand`) for card backgrounds
- **Borders/Shadows**: Use Light Gray for subtle borders or box shadows
- **Headers**: Use Navy (`--color-navy`) for card headers
- **Content Text**: Use Dark Slate for primary content and Medium Gray for secondary content

### Navigation

- **Primary Navigation**: Use Navy (`--color-navy`) background with white text
- **Secondary Navigation**: Use white background with Navy or Dark Slate text
- **Active States**: Use lighter background (e.g., rgba(255,255,255,0.1) on dark backgrounds)
- **Hover States**: Use Sky Blue for hover on light backgrounds

## Status Indicators

Use the following colors consistently for status:

- **Success/Complete/Approved**: `--color-success` (green)
- **Warning/In Progress/Pending**: `--color-warning` (amber)
- **Error/Failed/Rejected**: `--color-error` (red)
- **Info/Normal**: `--color-info` (blue)

For compliance levels:
- **Full Compliance**: `--color-compliance-full` (green)
- **Partial Compliance**: `--color-compliance-partial` (amber)
- **Non-Compliance**: `--color-compliance-non` (red)
- **Not Applicable**: `--color-compliance-na` (gray)

## Theme Implementation Guide

1. **Never use hardcoded colors**. Always use CSS variables or theme utilities.
2. **Check existing components** before creating new ones to maintain consistency.
3. **Use the themeUtils.js** for complex theming logic.
4. **Refer to this guide** when unsure about which color to use.
5. **Follow accessibility guidelines** ensuring proper contrast between text and backgrounds.

## How The Theme System Works

1. CSS variables are defined in `index.css`
2. These variables are also mapped in `theme.js` for Material-UI components
3. On application load, `main.jsx` applies these variables to the root element
4. Components use these variables for styling
5. Theme utilities in `themeUtils.js` provide helpers for complex theming scenarios

By following this guide, we ensure a consistent visual experience across the entire application. 