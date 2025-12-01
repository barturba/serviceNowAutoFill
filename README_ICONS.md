# Icon Generation Instructions

## Quick Start

1. **Open the icon generator:**
   ```bash
   open dev-tools/generate-icons.html
   ```

2. **Download the icons:**
   - Click "Download All" button in the browser
   - The three PNG files will download to your Downloads folder

3. **Move icons to extension directory:**
   ```bash
   mv ~/Downloads/icon*.png .
   ```

4. **Verify icons:**
   ```bash
   ls -lh icon*.png
   ```
   You should see:
   - icon16.png
   - icon48.png
   - icon128.png

5. **Build the extension:**
   ```bash
   ./build.sh
   ```

## Icon Design

The icons feature a clean clock design with:
- **ServiceNow blue/teal background** (#00A1D6)
- **Clock face** showing time (representing time entry)
- **Three sizes** for different contexts:
  - 16x16: Browser toolbar
  - 48x48: Extension management page
  - 128x128: Chrome Web Store listing

## Manual Icon Creation (Alternative)

If you prefer to create custom icons:

1. Create three PNG files with the required dimensions
2. Name them: `icon16.png`, `icon48.png`, `icon128.png`
3. Place them in the extension root directory
4. Run `./build.sh` to include them in the package

## Troubleshooting

**Icons not showing?**
- Ensure all three files are in the root directory
- Check file names match exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Verify PNG format (not JPEG or other formats)

**Build warning about missing icons?**
- Run `dev-tools/generate-icons.html` and download the icons
- Move them from Downloads to the extension directory
