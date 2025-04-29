#!/bin/bash

# Master Theme Update Script
# This script runs all three theme updater scripts in sequence to completely update
# the project's color scheme to match the provided palette.

# Make scripts executable
chmod +x scripts/theme-updater.js
chmod +x scripts/theme-updater-advanced.js
chmod +x scripts/theme-updater-mui.js

# Install required dependencies if not already installed
if ! npm list glob --silent > /dev/null 2>&1; then
  echo "Installing required dependencies..."
  npm install glob --save-dev
fi

echo "==================================="
echo "MIRSAT Theme Update Tool"
echo "==================================="
echo "This will update all components with the new color palette."
echo "Backups will be created for all modified files with .bak extension."
echo "Press Ctrl+C to cancel or any key to continue..."
read -n 1 -s

# Step 1: Run the basic theme updater to replace hex colors
echo -e "\n\n👉 Step 1/3: Running Basic Theme Updater"
node scripts/theme-updater.js

# Step 2: Run the advanced theme updater to handle more complex color formats
echo -e "\n\n👉 Step 2/3: Running Advanced Theme Updater"
node scripts/theme-updater-advanced.js

# Step 3: Run the MUI-specific theme updater
echo -e "\n\n👉 Step 3/3: Running MUI Theme Updater"
node scripts/theme-updater-mui.js

echo -e "\n\n==================================="
echo "Theme Update Complete! 🎉"
echo "==================================="
echo "The entire project has been updated to use the new color palette."
echo "You can now review the changes."
echo "Once you're satisfied, you can remove the backup files with:"
echo "find src -name '*.bak' -delete"
echo "===================================" 