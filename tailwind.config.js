/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Primary colors
          navy: {
            DEFAULT: '#1A3A5F', // Deep Navy Blue
            light: '#4B8C9E', // Soft Teal
            dark: '#2D4654', // Dark Slate
          },
          teal: {
            DEFAULT: '#4B8C9E', // Soft Teal
            light: '#A9CDCE', // Light Seafoam
          },
          seafoam: {
            DEFAULT: '#A9CDCE', // Light Seafoam
          },
          // Secondary colors
          sand: {
            DEFAULT: '#E3D9CA', // Sand Beige
          },
          coral: {
            DEFAULT: '#E99B83', // Muted Coral
          },
          skyblue: {
            DEFAULT: '#D6E5EA', // Pale Sky Blue
          },
          // Neutrals
          offwhite: {
            DEFAULT: '#F7F9FA', // Off-White
          },
          gray: {
            light: '#E2E8ED', // Light Gray
            medium: '#8CA3B7', // Medium Gray
            dark: '#2D4654', // Dark Slate
          },
          // Status colors
          status: {
            success: '#7CB797', // Muted Green
            warning: '#DFBE7F', // Soft Amber
            error: '#dc2434', // Subdued Red
            info: '#7CA7C8', // Gentle Blue
          },
          // Compliance levels
          compliance: {
            full: '#7CB797', // Success
            partial: '#DFBE7F', // Warning 
            non: '#dc2434', // Error
            na: '#8CA3B7', // Medium Gray
          }
        },
      },
    },
    plugins: [],
  }