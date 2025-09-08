#!/usr/bin/env node

/**
 * Theme Checker Script
 * 
 * This script scans source files to find hardcoded colors and suggests
 * replacing them with theme CSS variables.
 * 
 * Usage:
 *   node theme-checker.js [path]
 * 
 * If path is omitted, it defaults to 'src'
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Theme color map - maps hex values to CSS variable names
const colorMap = {
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
  '#dc2434': 'var(--color-error)',
  '#dc2434': 'var(--color-error)',
  '#7CA7C8': 'var(--color-info)',
  '#7ca7c8': 'var(--color-info)',
  
  // Common hard-coded colors that should be replaced
  'var(--color-navy)': 'var(--color-navy)',
  '#333': 'var(--color-gray-dark)',
  '#666': 'var(--color-gray-medium)',
  '#888': 'var(--color-gray-medium)',
  '#999': 'var(--color-gray-medium)',
  '#ccc': 'var(--color-gray-light)',
  '#ddd': 'var(--color-gray-light)',
  '#e0e0e0': 'var(--color-gray-light)',
  '#f5f5f5': 'var(--color-offwhite)',
  '#f0f4f8': 'var(--color-skyblue)',
  '#e8eaf6': 'var(--color-skyblue)',
  '#f5f7fb': 'var(--color-offwhite)',
  '#dc2626': 'var(--color-error)',
  '#b91c1c': 'var(--color-error)',
  '#f59e0b': 'var(--color-warning)',
  '#10b981': 'var(--color-success)',
};

// File extensions to scan
const extensions = ['.jsx', '.js', '.tsx', '.ts', '.css', '.scss'];

// Skip node_modules and dist directories
const skipDirs = ['node_modules', 'dist', 'build', '.git'];

// Parse command-line arguments
const args = process.argv.slice(2);
const rootDir = args[0] || 'src'; // Default to 'src' if no argument is provided

/**
 * Find files to scan
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
 * Scan a file for hardcoded colors
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    // Regular expression to match hex colors (#fff, #ffffff)
    const hexRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    
    let match;
    while ((match = hexRegex.exec(content)) !== null) {
      const hexColor = match[0];
      const normalizedHex = normalizeHexColor(hexColor);
      
      if (colorMap[normalizedHex]) {
        const lineInfo = findLineNumber(content, match.index);
        results.push({
          hexColor: normalizedHex,
          suggestion: colorMap[normalizedHex],
          line: lineInfo.line,
          column: lineInfo.column,
          context: lineInfo.context
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
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
 * Find line number and context from character index
 */
function findLineNumber(content, index) {
  const lines = content.slice(0, index).split('\n');
  const line = lines.length;
  const column = index - content.lastIndexOf('\n', index - 1);
  
  // Get context (the line containing the color)
  const allLines = content.split('\n');
  const context = allLines[line - 1].trim();
  
  return { line, column, context };
}

/**
 * Print results for a file
 */
function printResults(filePath, results) {
  if (results.length === 0) return;
  
  console.log(`\n\x1b[1m${filePath}\x1b[0m`);
  
  results.forEach(result => {
    console.log(`  Line ${result.line}, Column ${result.column}:`);
    console.log(`    \x1b[31m${result.hexColor}\x1b[0m should be replaced with \x1b[32m${result.suggestion}\x1b[0m`);
    console.log(`    Context: ${highlightColor(result.context, result.hexColor)}`);
  });
}

/**
 * Highlight the color in context
 */
function highlightColor(context, color) {
  return context.replace(
    new RegExp(color, 'g'), 
    `\x1b[31m${color}\x1b[0m`
  );
}

/**
 * Main function
 */
function main() {
  console.log(`\n\x1b[1mTheme Checker\x1b[0m`);
  console.log(`Scanning files in '${rootDir}' for hardcoded colors...`);
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to scan.`);
  
  let totalIssues = 0;
  const fileIssues = new Map();
  
  files.forEach(file => {
    const results = scanFile(file);
    if (results.length > 0) {
      printResults(file, results);
      fileIssues.set(file, results);
      totalIssues += results.length;
    }
  });
  
  console.log(`\n\x1b[1mScan complete.\x1b[0m`);
  console.log(`Found ${totalIssues} hardcoded colors in ${fileIssues.size} files.`);
  
  if (totalIssues > 0) {
    console.log(`\nRecommendation: Replace hardcoded colors with theme variables.`);
    console.log(`See the theming guide at src/docs/THEMING.md for more information.`);
  } else {
    console.log(`\nGreat! Your codebase is using theme variables consistently.`);
  }
}

// Run the script
main(); 