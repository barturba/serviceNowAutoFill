#!/bin/bash

# Version bump script for ServiceNow Time Entry Assistant
# Usage: ./bump-version.sh [patch|minor|major]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git working directory is clean
if [[ -n $(git status -s) ]]; then
  echo -e "${RED}Error: Working directory is not clean. Commit or stash changes first.${NC}"
  exit 1
fi

# Get bump type
BUMP_TYPE=${1:-patch}

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo -e "${RED}Error: Invalid bump type. Use: patch, minor, or major${NC}"
  echo "Usage: ./bump-version.sh [patch|minor|major]"
  exit 1
fi

# Read current version from manifest.json
CURRENT_VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
echo -e "${YELLOW}Current version: $CURRENT_VERSION${NC}"

# Parse version parts
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]:-0}
MINOR=${VERSION_PARTS[1]:-0}
PATCH=${VERSION_PARTS[2]:-0}

# Calculate new version based on bump type
case "$BUMP_TYPE" in
  patch)
    if [ ${#VERSION_PARTS[@]} -eq 2 ]; then
      # Two-part version (e.g., "2.1"), increment minor
      MINOR=$((MINOR + 1))
    else
      # Three-part version (e.g., "2.1.0"), increment patch
      PATCH=$((PATCH + 1))
    fi
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
esac

# Format new version based on original format
if [ ${#VERSION_PARTS[@]} -eq 2 ]; then
  NEW_VERSION="$MAJOR.$MINOR"
else
  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
fi

echo -e "${GREEN}New version: $NEW_VERSION${NC}"
echo ""

# Update manifest.json
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" manifest.json
rm manifest.json.bak
echo "✓ Updated manifest.json"

# Update package.json and package-lock.json to keep versions aligned
NODE_SCRIPT=$(cat <<'NODE'
const fs = require('fs');
const version = process.env.NEW_VERSION;

function updateJson(path, updater) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  updater(data);
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ Updated ${path}`);
}

updateJson('package.json', (pkg) => { pkg.version = version; });

updateJson('package-lock.json', (lock) => {
  lock.version = version;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].version = version;
  }
});
NODE
)
NEW_VERSION="$NEW_VERSION" node -e "$NODE_SCRIPT"

# Build the extension
echo ""
./build.sh

# Git operations
echo ""
echo "Creating git commit and tag..."
git add manifest.json package.json package-lock.json
git commit -m "Bump version to $NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Version $NEW_VERSION"

echo ""
echo -e "${GREEN}✓ Version bumped successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the commit: git show HEAD"
echo "  2. Push changes: git push && git push --tags"
echo "  3. Upload: build/servicenow-time-entry-assistant-v$NEW_VERSION.zip"
echo ""
