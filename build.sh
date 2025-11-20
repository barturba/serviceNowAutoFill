#!/bin/bash

# Build script for ServiceNow Time Entry Assistant Chrome Extension
# Creates a zip file ready for Chrome Web Store upload

set -e  # Exit on error

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
EXTENSION_NAME="servicenow-time-entry-assistant"
BUILD_DIR="build"
ZIP_NAME="${EXTENSION_NAME}-v${VERSION}.zip"

echo "Building ${EXTENSION_NAME} v${VERSION}..."

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Remove old zip file if it exists
if [ -f "$BUILD_DIR/$ZIP_NAME" ]; then
  echo "Removing old build: $BUILD_DIR/$ZIP_NAME"
  rm "$BUILD_DIR/$ZIP_NAME"
fi

# Create zip file with extension files (exclude git, build dir, scripts, and docs)
echo "Creating zip file..."

# Check if icons exist and include them
ICON_FILES=""
if [ -f "icon16.png" ] && [ -f "icon48.png" ] && [ -f "icon128.png" ]; then
  ICON_FILES="icon16.png icon48.png icon128.png"
  echo "Including icon files..."
else
  echo "⚠ Warning: Icon files not found. Run generate-icons.html to create them."
fi

zip -r "$BUILD_DIR/$ZIP_NAME" \
  manifest.json \
  popup.html \
  popup.js \
  config.js \
  developer-tools.js \
  $ICON_FILES \
  -x "*.git*" "build/*" "*.sh" "*.md" "*.DS_Store" "*.html"

echo "✓ Build complete: $BUILD_DIR/$ZIP_NAME"
echo ""
echo "File size: $(du -h "$BUILD_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "Contents:"
unzip -l "$BUILD_DIR/$ZIP_NAME"
echo ""
echo "Ready to upload to Chrome Web Store!"
