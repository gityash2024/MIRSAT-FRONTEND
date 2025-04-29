#!/usr/bin/env node

/**
 * Material-UI Theme Updater Script
 * 
 * This script specifically targets Material-UI theme definitions and styled-component
 * styling objects, replacing hardcoded colors with theme variables.
 * 
 * Usage:
 *   node theme-updater-mui.js [path]
 * 
 * If path is omitted, it defaults to 'src'
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Theme color mappings for MUI and styled-components
const colorMappings = {
  // Primary colors
  '#1A3A5F': 'var(--color-navy)',
  '#1a3a5f': 'var(--color-navy)',
  '#142f4c': 'var(--color-navy-dark)',
  '#4B8C9E': 'var(--color-teal)',
  '#4b8c9e': 'var(--color-teal)',
  '#A9CDCE': 'var(--color-seafoam)',
  '#a9cdce': 'var(--color-seafoam)',
  
  // Secondary colors
  '#E3D9CA': 'var(--color-sand)',
  '#e3d9ca': 'var(--color-sand)',
  '#E99B83': 'var(--color-coral)',
  '#e99b83': 'var(--color-coral)',
  '#D6E5EA': 'var(--color-skyblue)',
  '#d6e5ea': 'var(--color-skyblue)',
  
  // Neutrals
  '#F7F9FA': 'var(--color-offwhite)',
  '#f7f9fa': 'var(--color-offwhite)',
  '#E2E8ED': 'var(--color-gray-light)',
  '#e2e8ed': 'var(--color-gray-light)',
  '#8CA3B7': 'var(--color-gray-medium)',
  '#8ca3b7': 'var(--color-gray-medium)',
  '#2D4654': 'var(--color-gray-dark)',
  '#2d4654': 'var(--color-gray-dark)',
};

// File extensions to update
const extensions = ['.jsx', '.js', '.tsx', '.ts'];

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
 * Update hardcoded colors in style objects
 * 
 * This handles structures like:
 * backgroundColor: '#f5f5f5',
 * color: '#333',
 */
function updateStyleObjects(content) {
  // Match property: value patterns in style objects
  const stylePropertyRegex = /(\w+):\s*['"]?(#[0-9a-fA-F]{3,6})['"]?/g;
  
  return content.replace(stylePropertyRegex, (match, prop, color) => {
    const normalizedHex = normalizeHexColor(color);
    if (colorMappings[normalizedHex]) {
      // Replace the hex color with the theme variable
      return `${prop}: ${colorMappings[normalizedHex]}`;
    }
    return match;
  });
}

/**
 * Update MUI theme definitions
 * 
 * This handles structures like:
 * primary: {
 *   main: '#1A3A5F',
 *   light: '#4B8C9E',
 * }
 */
function updateMuiTheme(content) {
  // Find theme definitions with hex colors
  const muiThemeRegex = /([\w.]+):\s*['"]?(#[0-9a-fA-F]{3,6})['"]?/g;
  
  return content.replace(muiThemeRegex, (match, prop, color) => {
    const normalizedHex = normalizeHexColor(color);
    if (colorMappings[normalizedHex]) {
      // Replace the hex color with the theme variable
      return `${prop}: '${colorMappings[normalizedHex]}'`;
    }
    return match;
  });
}

/**
 * Process a file to update styled-component styles and MUI theme
 */
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Look for either styled-components or MUI theme content
    const hasMuiTheme = content.includes('createTheme') || content.includes('makeStyles');
    const hasStyledComponents = content.includes('styled.') || content.includes('styled(');
    
    if (hasMuiTheme || hasStyledComponents) {
      // If this is a theme file or has styled components, process it
      content = updateStyleObjects(content);
      content = updateMuiTheme(content);
      
      if (content !== originalContent) {
        // Create a backup of the original file
        const backupPath = `${filePath}.bak`;
        fs.writeFileSync(backupPath, originalContent);
        
        // Save the updated file
        fs.writeFileSync(filePath, content);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Update the main theme.js file specifically
 */
function updateThemeFile() {
  const themeFilePath = path.join(rootDir, 'config/theme.js');
  if (!fs.existsSync(themeFilePath)) return false;
  
  try {
    let content = fs.readFileSync(themeFilePath, 'utf8');
    const originalContent = content;
    
    // Update color definitions in theme.js
    content = content.replace(/([\w.]+):\s*['"]?(#[0-9a-fA-F]{3,6})['"]?/g, (match, prop, color) => {
      // Don't replace colors in the color definitions section itself
      if (match.includes('hex:')) {
        return match;
      }
      
      const normalizedHex = normalizeHexColor(color);
      if (colorMappings[normalizedHex]) {
        return `${prop}: '${colorMappings[normalizedHex]}'`;
      }
      return match;
    });
    
    if (content !== originalContent) {
      // Create a backup of the original file
      const backupPath = `${themeFilePath}.bak`;
      fs.writeFileSync(backupPath, originalContent);
      
      // Save the updated file
      fs.writeFileSync(themeFilePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error updating theme file:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`\n\x1b[1mMaterial-UI Theme Updater\x1b[0m`);
  console.log(`Updating style objects and theme definitions in files in '${rootDir}'...`);
  
  // First, try to update the main theme file
  const themeUpdated = updateThemeFile();
  if (themeUpdated) {
    console.log('✓ Updated main theme.js file');
  }
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to process.`);
  
  let updatedCount = 0;
  
  files.forEach(file => {
    const updated = updateFile(file);
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