#!/usr/bin/env node

/**
 * Theme Updater Script
 * 
 * This script automatically replaces hardcoded colors with theme variables
 * throughout the entire codebase.
 * 
 * Usage:
 *   node theme-updater.js [path]
 * 
 * If path is omitted, it defaults to 'src'
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mappings from hardcoded values to CSS variables
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
  
  // Status colors
  '#7CB797': 'var(--color-success)',
  '#7cb797': 'var(--color-success)',
  '#DFBE7F': 'var(--color-warning)',
  '#dfbe7f': 'var(--color-warning)',
  '#D18C92': 'var(--color-error)',
  '#d18c92': 'var(--color-error)',
  '#7CA7C8': 'var(--color-info)',
  '#7ca7c8': 'var(--color-info)',
  
  // Common hardcoded colors
  'var(--color-navy)': 'var(--color-navy)',
  '#333333': 'var(--color-gray-dark)',
  '#333': 'var(--color-gray-dark)',
  '#666666': 'var(--color-gray-medium)',
  '#666': 'var(--color-gray-medium)',
  '#888888': 'var(--color-gray-medium)',
  '#888': 'var(--color-gray-medium)',
  '#999999': 'var(--color-gray-medium)',
  '#999': 'var(--color-gray-medium)',
  '#cccccc': 'var(--color-gray-light)',
  '#ccc': 'var(--color-gray-light)',
  '#dddddd': 'var(--color-gray-light)',
  '#ddd': 'var(--color-gray-light)',
  '#e0e0e0': 'var(--color-gray-light)',
  '#eeeeee': 'var(--color-gray-light)',
  '#eee': 'var(--color-gray-light)',
  '#f0f0f0': 'var(--color-offwhite)',
  '#f5f5f5': 'var(--color-offwhite)',
  '#f8f8f8': 'var(--color-offwhite)',
  '#f0f4f8': 'var(--color-skyblue)',
  '#e8eaf6': 'var(--color-skyblue)',
  '#f5f7fb': 'var(--color-offwhite)',
  '#dc2626': 'var(--color-error)',
  '#b91c1c': 'var(--color-error)',
  '#f59e0b': 'var(--color-warning)',
  '#10b981': 'var(--color-success)',
  '#3b82f6': 'var(--color-info)',
  
  // Material UI colors that might be used
  '#1976d2': 'var(--color-navy)',
  '#2196f3': 'var(--color-info)',
  '#f44336': 'var(--color-error)',
  '#ff9800': 'var(--color-warning)',
  '#4caf50': 'var(--color-success)',
  '#9e9e9e': 'var(--color-gray-medium)',
  '#e0e0e0': 'var(--color-gray-light)',
  '#fafafa': 'var(--color-offwhite)',
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
 * Replace all color instances in a file with theme variables
 */
function updateFileColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = false;

    // Create a backup of the original file
    const backupPath = `${filePath}.bak`;
    fs.writeFileSync(backupPath, content);
    
    // Regular expression to match hex colors in different contexts
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    
    // Replace all color instances
    content = content.replace(hexRegex, (match) => {
      const normalizedHex = normalizeHexColor(match);
      
      if (colorMappings[normalizedHex]) {
        replaced = true;
        return colorMappings[normalizedHex];
      }
      
      return match;
    });
    
    // Save file if changes were made
    if (replaced) {
      fs.writeFileSync(filePath, content);
      return true;
    } else {
      // Remove backup if no changes were made
      fs.unlinkSync(backupPath);
      return false;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`\n\x1b[1mTheme Updater\x1b[0m`);
  console.log(`Updating color values in files in '${rootDir}'...`);
  
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