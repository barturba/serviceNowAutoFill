#!/bin/bash

# Build script for ServiceNow Time Entry Assistant Chrome Extension
# Creates a zip file ready for Chrome Web Store upload
# Usage: ./build.sh [--draft] [--submit]

set -e  # Exit on error

# Parse arguments
DRAFT=false
SUBMIT=false
for arg in "$@"; do
  case $arg in
    --draft)
      DRAFT=true
      ;;
    --submit)
      SUBMIT=true
      DRAFT=true  # Submitting requires upload
      ;;
  esac
done

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
EXTENSION_NAME="servicenow-time-entry-assistant"
BUILD_DIR="build"
ZIP_NAME="${EXTENSION_NAME}-v${VERSION}.zip"

echo "Building ${EXTENSION_NAME} v${VERSION}..."

# Run tests before building (if npm is available and node_modules exists)
if command -v npm &> /dev/null && [ -d "node_modules" ]; then
  echo "Running tests..."
  npm test
  if [ $? -ne 0 ]; then
    echo "✗ Tests failed! Aborting build."
    exit 1
  fi
  echo "✓ All tests passed"
  echo ""
else
  echo "⚠ Skipping tests (npm not installed or dependencies not installed)"
  echo "  Run 'npm install' to enable test verification"
  echo ""
fi

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
  echo "⚠ Warning: Icon files not found."
fi

zip -r "$BUILD_DIR/$ZIP_NAME" \
  manifest.json \
  popup/ \
  content/ \
  core/ \
  utils/ \
  $ICON_FILES \
  -x "*.git*" "build/*" "*.sh" "*.md" "*.DS_Store" "dev-tools/*" "docs/*"

echo "✓ Build complete: $BUILD_DIR/$ZIP_NAME"
echo ""
echo "File size: $(du -h "$BUILD_DIR/$ZIP_NAME" | cut -f1)"
echo ""
echo "Contents:"
unzip -l "$BUILD_DIR/$ZIP_NAME"
echo ""

# Upload to Chrome Web Store if --draft or --submit flag is set
if [ "$DRAFT" = true ]; then
  echo ""
  echo "=========================================="
  echo "Uploading to Chrome Web Store..."
  echo "=========================================="
  
  # Check if op CLI is available
  if ! command -v op &> /dev/null; then
    echo "✗ Error: 1Password CLI (op) not found. Please install it first."
    exit 1
  fi
  
  # Load credentials from 1Password
  echo "Loading credentials from 1Password..."
  EXTENSION_ID=$(op read "op://AppSecrets/Chrome Web Store - ServiceNow AutoFill/extension_id")
  CLIENT_ID=$(op read "op://AppSecrets/Chrome Web Store - ServiceNow AutoFill/client_id")
  CLIENT_SECRET=$(op read "op://AppSecrets/Chrome Web Store - ServiceNow AutoFill/client_secret")
  REFRESH_TOKEN=$(op read "op://AppSecrets/Chrome Web Store - ServiceNow AutoFill/refresh_token")
  
  # Get access token
  echo "Getting access token..."
  TOKEN_RESPONSE=$(curl -s "https://oauth2.googleapis.com/token" \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "refresh_token=${REFRESH_TOKEN}" \
    -d "grant_type=refresh_token")
  
  ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
  
  if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "✗ Error: Failed to get access token"
    echo "$TOKEN_RESPONSE" | jq .
    exit 1
  fi
  
  echo "✓ Access token obtained"
  
  # Upload to Chrome Web Store
  echo "Uploading ${ZIP_NAME} to Chrome Web Store..."
  UPLOAD_RESPONSE=$(curl -s -X PUT \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "x-goog-api-version: 2" \
    -T "$BUILD_DIR/$ZIP_NAME" \
    "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${EXTENSION_ID}")
  
  UPLOAD_STATE=$(echo "$UPLOAD_RESPONSE" | jq -r '.uploadState')
  
  if [ "$UPLOAD_STATE" = "SUCCESS" ]; then
    echo "✓ Upload successful! (saved as draft)"
  else
    echo "✗ Upload failed:"
    echo "$UPLOAD_RESPONSE" | jq .
    exit 1
  fi
  
  # Submit for review if --submit flag is set
  if [ "$SUBMIT" = true ]; then
    echo ""
    echo "Submitting for review..."
    SUBMIT_RESPONSE=$(curl -s -X POST \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "x-goog-api-version: 2" \
      -H "Content-Length: 0" \
      "https://www.googleapis.com/chromewebstore/v1.1/items/${EXTENSION_ID}/publish")
    
    SUBMIT_STATUS=$(echo "$SUBMIT_RESPONSE" | jq -r '.status[0]')
    
    if [ "$SUBMIT_STATUS" = "OK" ]; then
      echo "✓ Extension submitted for review!"
    else
      echo "Submit response:"
      echo "$SUBMIT_RESPONSE" | jq .
    fi
  fi
  
  echo ""
  echo "=========================================="
  echo "✓ Chrome Web Store operation complete!"
  echo "=========================================="
else
  echo "Ready to upload to Chrome Web Store!"
  echo "  --draft   Upload as draft (no review)"
  echo "  --submit  Upload and submit for review"
fi
