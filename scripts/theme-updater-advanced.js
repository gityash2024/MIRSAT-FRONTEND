#!/usr/bin/env node

/**
 * Advanced Theme Updater Script
 * 
 * This script handles more complex color formats including:
 * - rgba() and rgb() values
 * - Named colors
 * - Material UI theme colors
 * 
 * Usage:
 *   node theme-updater-advanced.js [path]
 * 
 * If path is omitted, it defaults to 'src'
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Theme color palette
const themeColors = {
  // Primary colors
  navy: { hex: '#1A3A5F', var: 'var(--color-navy)' },
  navyDark: { hex: '#142f4c', var: 'var(--color-navy-dark)' },
  teal: { hex: '#4B8C9E', var: 'var(--color-teal)' },
  seafoam: { hex: '#A9CDCE', var: 'var(--color-seafoam)' },
  
  // Secondary colors
  sand: { hex: '#E3D9CA', var: 'var(--color-sand)' },
  coral: { hex: '#E99B83', var: 'var(--color-coral)' },
  skyblue: { hex: '#D6E5EA', var: 'var(--color-skyblue)' },
  
  // Neutrals
  offwhite: { hex: '#F7F9FA', var: 'var(--color-offwhite)' },
  grayLight: { hex: '#E2E8ED', var: 'var(--color-gray-light)' },
  grayMedium: { hex: '#8CA3B7', var: 'var(--color-gray-medium)' },
  grayDark: { hex: '#2D4654', var: 'var(--color-gray-dark)' },
  
  // Status colors
  success: { hex: '#7CB797', var: 'var(--color-success)' },
  warning: { hex: '#DFBE7F', var: 'var(--color-warning)' },
  error: { hex: '#D18C92', var: 'var(--color-error)' },
  info: { hex: '#7CA7C8', var: 'var(--color-info)' },
  
  // Common colors that map to our theme
  black: { hex: '#000000', var: 'black' }, // Keep as is
  white: { hex: '#FFFFFF', var: 'white' }, // Keep as is
};

// Color mappings for common named colors and hex values
const colorMappings = {
  // Primary colors (exact hex matches)
  '#1A3A5F': themeColors.navy.var,
  '#1a3a5f': themeColors.navy.var,
  '#142f4c': themeColors.navyDark.var,
  '#4B8C9E': themeColors.teal.var,
  '#4b8c9e': themeColors.teal.var,
  '#A9CDCE': themeColors.seafoam.var,
  '#a9cdce': themeColors.seafoam.var,
  
  // Secondary colors
  '#E3D9CA': themeColors.sand.var,
  '#e3d9ca': themeColors.sand.var,
  '#E99B83': themeColors.coral.var,
  '#e99b83': themeColors.coral.var,
  '#D6E5EA': themeColors.skyblue.var,
  '#d6e5ea': themeColors.skyblue.var,
  
  // Neutrals
  '#F7F9FA': themeColors.offwhite.var,
  '#f7f9fa': themeColors.offwhite.var,
  '#E2E8ED': themeColors.grayLight.var,
  '#e2e8ed': themeColors.grayLight.var,
  '#8CA3B7': themeColors.grayMedium.var,
  '#8ca3b7': themeColors.grayMedium.var,
  '#2D4654': themeColors.grayDark.var,
  '#2d4654': themeColors.grayDark.var,
  
  // Status colors
  '#7CB797': themeColors.success.var,
  '#7cb797': themeColors.success.var,
  '#DFBE7F': themeColors.warning.var,
  '#dfbe7f': themeColors.warning.var,
  '#D18C92': themeColors.error.var,
  '#d18c92': themeColors.error.var,
  '#7CA7C8': themeColors.info.var,
  '#7ca7c8': themeColors.info.var,
  
  // Common hardcoded colors from design systems
  'var(--color-navy)': themeColors.navy.var, // Material blue-900
  '#283593': themeColors.navy.var, // Material indigo-900
  '#333333': themeColors.grayDark.var,
  '#333': themeColors.grayDark.var,
  '#666666': themeColors.grayMedium.var,
  '#666': themeColors.grayMedium.var,
  '#888888': themeColors.grayMedium.var,
  '#888': themeColors.grayMedium.var,
  '#999999': themeColors.grayMedium.var,
  '#999': themeColors.grayMedium.var,
  '#cccccc': themeColors.grayLight.var,
  '#ccc': themeColors.grayLight.var,
  '#dddddd': themeColors.grayLight.var,
  '#ddd': themeColors.grayLight.var,
  '#e0e0e0': themeColors.grayLight.var,
  '#eeeeee': themeColors.grayLight.var,
  '#eee': themeColors.grayLight.var,
  '#f0f0f0': themeColors.offwhite.var,
  '#f5f5f5': themeColors.offwhite.var,
  '#f8f8f8': themeColors.offwhite.var,
  '#f0f4f8': themeColors.skyblue.var,
  '#e8eaf6': themeColors.skyblue.var,
  '#f5f7fb': themeColors.offwhite.var,
  
  // Error colors
  '#dc2626': themeColors.error.var, // Tailwind red-600
  '#b91c1c': themeColors.error.var, // Tailwind red-700
  '#f44336': themeColors.error.var, // Material red
  
  // Warning colors
  '#f59e0b': themeColors.warning.var, // Tailwind amber-500
  '#ff9800': themeColors.warning.var, // Material orange
  '#ed6c02': themeColors.warning.var, // Material orange dark
  
  // Success colors
  '#10b981': themeColors.success.var, // Tailwind emerald-500
  '#4caf50': themeColors.success.var, // Material green
  '#2e7d32': themeColors.success.var, // Material green dark
  
  // Info colors
  '#3b82f6': themeColors.info.var, // Tailwind blue-500
  '#2196f3': themeColors.info.var, // Material blue
  '#0288d1': themeColors.info.var, // Material light blue
  
  // Gray colors
  '#9e9e9e': themeColors.grayMedium.var, // Material gray
  '#757575': themeColors.grayMedium.var, // Material gray dark
  '#fafafa': themeColors.offwhite.var, // Material gray 50
};

// Named color mappings
const namedColorMappings = {
  'lightgray': themeColors.grayLight.var,
  'lightgrey': themeColors.grayLight.var,
  'gray': themeColors.grayMedium.var,
  'grey': themeColors.grayMedium.var,
  'darkgray': themeColors.grayDark.var,
  'darkgrey': themeColors.grayDark.var,
  'whitesmoke': themeColors.offwhite.var,
  'gainsboro': themeColors.grayLight.var,
  'lightblue': themeColors.skyblue.var,
  'steelblue': themeColors.teal.var,
  'lightsteelblue': themeColors.skyblue.var,
  'cornflowerblue': themeColors.info.var,
  'dodgerblue': themeColors.info.var,
  'royalblue': themeColors.navy.var,
  'midnightblue': themeColors.navy.var,
  'navy': themeColors.navy.var,
  'teal': themeColors.teal.var,
  'lightsalmon': themeColors.coral.var,
  'salmon': themeColors.coral.var,
  'coral': themeColors.coral.var,
  'tomato': themeColors.error.var,
  'crimson': themeColors.error.var,
  'firebrick': themeColors.error.var,
  'darkred': themeColors.error.var,
  'lightgreen': themeColors.success.var,
  'mediumseagreen': themeColors.success.var,
  'seagreen': themeColors.success.var,
  'forestgreen': themeColors.success.var,
  'lemonchiffon': themeColors.sand.var,
  'beige': themeColors.sand.var,
  'antiquewhite': themeColors.sand.var,
  'blanchedalmond': themeColors.sand.var,
  'burlywood': themeColors.sand.var,
};

// File extensions to update
const extensions = ['.jsx', '.js', '.tsx', '.ts', '.css', '.scss'];

// Skip directories
const skipDirs = ['node_modules', 'dist', 'build', '.git'];

// Parse command-line arguments
const args = process.argv.slice(2);
const rootDir = args[0] || 'src'; // Default to 'src' if no argument is provided

/**
 * Find all files to process
 */
function findFiles(dir) {
  return glob.sync(`${dir}/**/*`, { nodir: true })
    .filter(file => {
      const ext = path.extname(file);
      return extensions.includes(ext) && 
             !skipDirs.some(skipDir => file.includes(`/${skipDir}/`));
    });
}

/**
 * Normalize hex color (convert short form #abc to #aabbcc)
 */
function normalizeHexColor(hex) {
  hex = hex.toLowerCase();
  
  // If it's shorthand form (#abc), convert to full form (#aabbcc)
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  return hex;
}

/**
 * Convert rgb/rgba to hex to facilitate mapping
 * rgb(51, 51, 51) -> #333333
 */
function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Replace all color instances in a file with theme variables
 */
function updateFileColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Create a backup of the original file
    const backupPath = `${filePath}.bak`;
    
    // 1. Replace hex colors
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    content = content.replace(hexRegex, (match) => {
      const normalizedHex = normalizeHexColor(match);
      return colorMappings[normalizedHex] || match;
    });
    
    // 2. Replace rgb colors
    const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    content = content.replace(rgbRegex, (match, r, g, b) => {
      const hexColor = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
      return colorMappings[hexColor] || match;
    });
    
    // 3. Replace rgba colors (preserving alpha)
    const rgbaRegex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g;
    content = content.replace(rgbaRegex, (match, r, g, b, a) => {
      const hexColor = rgbToHex(parseInt(r), parseInt(g), parseInt(b));
      const themeVar = colorMappings[hexColor];
      
      if (themeVar && a !== '1') {
        // If we have a theme variable and alpha is not 1, replace with rgba using the var
        // Extract the actual variable name without the var()
        const varName = themeVar.match(/var\((.*?)\)/)?.[1];
        if (varName) {
          return `rgba(var(${varName}-rgb), ${a})`;
        }
      }
      
      return themeVar || match;
    });
    
    // 4. Replace named colors
    Object.keys(namedColorMappings).forEach(color => {
      // Use word boundaries to avoid partial matches
      const namedColorRegex = new RegExp(`\\b${color}\\b`, 'gi');
      content = content.replace(namedColorRegex, namedColorMappings[color]);
    });
    
    // Check if content was modified
    if (content !== originalContent) {
      // Save backup
      fs.writeFileSync(backupPath, originalContent);
      
      // Save modified file
      fs.writeFileSync(filePath, content);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Enhance the index.css file to include RGB variants of CSS variables
 * This will help with rgba() transparency usage
 */
function enhanceIndexCss() {
  try {
    const indexCssPath = path.join(rootDir, 'index.css');
    if (!fs.existsSync(indexCssPath)) return false;
    
    let content = fs.readFileSync(indexCssPath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Check if RGB variables are already defined
    if (!content.includes('-rgb:')) {
      // Add RGB versions of our color variables
      let rgbVariables = '\n/* RGB versions of colors for rgba usage */\n';
      
      Object.keys(themeColors).forEach(colorName => {
        const color = themeColors[colorName];
        if (color.hex && color.hex.startsWith('#')) {
          // Convert hex to RGB components
          const hex = color.hex.substring(1);
          let r, g, b;
          
          if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
          } else if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
          }
          
          if (r !== undefined && g !== undefined && b !== undefined) {
            const varName = color.var.match(/var\((.*?)\)/)?.[1];
            if (varName) {
              rgbVariables += `  ${varName}-rgb: ${r}, ${g}, ${b};\n`;
              modified = true;
            }
          }
        }
      });
      
      // Insert RGB variables into :root
      if (modified) {
        content = content.replace(/:root\s*{([^}]+)}/, (match, group) => {
          return `:root {${group}${rgbVariables}}`;
        });
      }
    }
    
    // Save the file if it was modified
    if (content !== originalContent) {
      fs.writeFileSync(indexCssPath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error enhancing index.css:', error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`\n\x1b[1mAdvanced Theme Updater\x1b[0m`);
  console.log(`Updating color values in files in '${rootDir}'...`);
  
  // First, enhance the index.css file to include RGB variants
  const cssEnhanced = enhanceIndexCss();
  if (cssEnhanced) {
    console.log('✓ Enhanced index.css with RGB color variables');
  }
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to process.`);
  
  let updatedCount = 0;
  
  files.forEach(file => {
    const updated = updateFileColors(file);
    if (updated) {
      console.log(`✓ Updated: ${file}`);
      updatedCount++;
    }
  });
  
  console.log(`\n\x1b[1mUpdate complete!\x1b[0m`);
  console.log(`Updated ${updatedCount} files with theme variables.`);
  
  if (updatedCount > 0) {
    console.log(`\nBackup files were created with .bak extension. You can delete them when you're satisfied with the changes.`);
    console.log(`To remove all backups, run: find ${rootDir} -name "*.bak" -delete`);
  }
}

// Run the script
main(); 