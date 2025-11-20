#!/bin/bash

# Prepare screenshots for Chrome Web Store
# Requirements: 1280x800 or 640x400, JPEG or 24-bit PNG (no alpha)

set -e

echo "Preparing screenshots for Chrome Web Store..."
echo ""

# Create screenshots directory
mkdir -p screenshots

# Input file
INPUT="screenshot.png"

if [ ! -f "$INPUT" ]; then
  echo "Error: screenshot.png not found!"
  exit 1
fi

# Get current dimensions
WIDTH=$(sips -g pixelWidth "$INPUT" | grep pixelWidth | awk '{print $2}')
HEIGHT=$(sips -g pixelHeight "$INPUT" | grep pixelHeight | awk '{print $2}')

echo "Original dimensions: ${WIDTH}x${HEIGHT}"
echo ""

# Determine target size (640x400 for smaller images, 1280x800 for larger)
if [ "$WIDTH" -gt 800 ]; then
  TARGET_WIDTH=1280
  TARGET_HEIGHT=800
else
  TARGET_WIDTH=640
  TARGET_HEIGHT=400
fi

echo "Target size: ${TARGET_WIDTH}x${TARGET_HEIGHT}"
echo ""

# Create resized PNG (24-bit, no alpha) using ImageMagick
echo "Creating PNG screenshot (24-bit, no alpha)..."
if command -v magick &> /dev/null; then
  magick "$INPUT" -resize ${TARGET_WIDTH}x${TARGET_HEIGHT}! -alpha off -type TrueColor "screenshots/screenshot-1.png" 2>&1 | grep -v "WARNING" || true
elif command -v convert &> /dev/null; then
  convert "$INPUT" -resize ${TARGET_WIDTH}x${TARGET_HEIGHT}! -alpha off -type TrueColor "screenshots/screenshot-1.png" 2>&1 | grep -v "WARNING" || true
else
  # Fallback to sips (may still have alpha)
  sips -z $TARGET_HEIGHT $TARGET_WIDTH "$INPUT" --out "screenshots/screenshot-1.png" > /dev/null
fi

echo "✓ Created: screenshots/screenshot-1.png (${TARGET_WIDTH}x${TARGET_HEIGHT})"

# Create JPEG version
echo "Creating JPEG screenshot..."
if command -v magick &> /dev/null; then
  magick "screenshots/screenshot-1.png" -quality 90 "screenshots/screenshot-1.jpg" 2>&1 | grep -v "WARNING" || true
elif command -v convert &> /dev/null; then
  convert "screenshots/screenshot-1.png" -quality 90 "screenshots/screenshot-1.jpg" 2>&1 | grep -v "WARNING" || true
else
  sips -s format jpeg "screenshots/screenshot-1.png" --out "screenshots/screenshot-1.jpg" > /dev/null
fi

echo "✓ Created: screenshots/screenshot-1.jpg (${TARGET_WIDTH}x${TARGET_HEIGHT})"
echo ""

# Show file info
echo "Screenshots ready:"
ls -lh screenshots/screenshot-1.*
echo ""

echo "✓ Screenshots prepared successfully!"
echo ""
echo "Upload either PNG or JPG to Chrome Web Store (both are provided)"
echo "Location: screenshots/"
