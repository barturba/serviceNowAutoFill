# ServiceNow Time Entry Assistant

A Chrome extension that streamlines time tracking for ServiceNow users by providing quick, one-click time entries and automated alert resolution workflows.

## Features

### Quick Time Entry
- One-click time entry buttons: 15min, 30min, 45min, 1hr, 1.5hr, 2hr
- Automatically fills `time_worked`, `work_start`, and `work_end` fields
- Preserves existing work notes
- Auto-populates `work_type` field
- Works with incidents, catalog tasks, and other ServiceNow tables
- Compatible with both classic and modern ServiceNow UIs

### Alert Cleared Workflow
- One-click button that automates alert resolution:
  - Sets time to 15 minutes
  - Adds "Alert cleared. Closing ticket." to work notes
  - Sets state to "Resolved"
  - Opens Resolution Information tab
  - Sets resolution code to "Resolved - permanently"
  - Fills resolution notes automatically
- Smart scroll preservation - maintains your page position during automation

## Installation

### From Chrome Web Store
1. Visit the Chrome Web Store listing
2. Click "Add to Chrome"
3. Grant permissions when prompted

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/barturba/serviceNowAutoFill.git
   cd serviceNowAutoFill
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the project directory

5. The extension icon should now appear in your Chrome toolbar

## Usage

1. Navigate to any ServiceNow incident or task page
2. Click the extension icon in your Chrome toolbar
3. Choose your action:
   - **Blue buttons**: Select a time duration (15min-2hr) for quick time entry
   - **Green buttons**: Fill time and automatically save the form
   - **Alert Cleared button**: Run the automated alert resolution workflow

### Additional Comments
- Enter optional comments in the "Additional Comments" field
- If left empty, the extension will use the last work note from the ticket
- Comments are added to the `work_notes` field

## Supported Fields

- `time_worked` (hours:minutes:seconds)
- `u_work_start` (start timestamp)
- `u_work_end` (end timestamp)
- `work_notes` (preserves existing content)
- `u_work_type` (auto-selects appropriate type)
- `state` (for alert resolution)
- `close_code` / `resolution_code` (for alert resolution)
- `close_notes` / `resolution_notes` (for alert resolution)

## Architecture

The extension is organized into several key modules:

### Core Modules
- `core/formFiller.js` - Main form filling logic
- `core/alertClearedProcessor.js` - Alert resolution workflow

### Utilities
- `utils/parsers/timeParser.js` - Time parsing and formatting
- `utils/fields/core/fieldFinder.js` - Field discovery utilities
- `utils/fields/finders/` - Specific field finders for each field type
- `utils/fields/fillers/` - Field filling logic
- `utils/fields/helpers/` - Helper utilities for field manipulation
- `utils/dom/` - DOM utilities (iframe finding, shadow DOM search, scroll management)
- `utils/actions/` - Save button finding and handling
- `utils/constants.js` - Timing constants and configuration

### Popup Interface
- `popup/popup.html` - Extension popup UI
- `popup/scripts/` - Popup scripts (button handlers, script injection)
- `popup/styles/` - Popup styling

### Content Scripts
- `content/inject.js` - Entry point for injected scripts

## Development

### Project Structure
```
serviceNowAutoFill/
├── core/                 # Core form filling logic
├── content/              # Content script entry point
├── popup/                # Extension popup UI
│   ├── scripts/         # Popup JavaScript
│   └── styles/          # Popup CSS
├── utils/                # Utility modules
│   ├── actions/         # Save button utilities
│   ├── dom/             # DOM manipulation utilities
│   ├── fields/          # Field finding and filling
│   └── parsers/         # Parsing utilities
├── dev-tools/           # Development tools
├── manifest.json        # Chrome extension manifest
└── README.md            # This file
```

### Building

The extension can be packaged using the provided build script:

```bash
./build.sh
```

This creates a ZIP file in the `build/` directory ready for Chrome Web Store submission.

### Version Bumping

Use the version bump script:

```bash
./bump-version.sh
```

This updates the version in `manifest.json` and creates a new build.

## Permissions

This extension requires the following permissions:

- **activeTab**: Access the currently active ServiceNow tab to fill time entry fields
- **scripting**: Inject scripts into ServiceNow pages to interact with form fields
- **Host permission (*.service-now.com)**: Access and modify ServiceNow form fields

## Privacy

This extension does not collect, store, or transmit any user data. All operations are performed locally in the browser on ServiceNow pages. No information is sent to external servers.

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- **GitHub**: [https://github.com/barturba/serviceNowAutoFill](https://github.com/barturba/serviceNowAutoFill)
- **Email**: bartisimo@gmail.com

## License

See LICENSE file for details.

## Related Documentation

- [Privacy Practices](PRIVACY_PRACTICES.md) - Detailed privacy information for Chrome Web Store
- [Store Listing](STORE_LISTING.md) - Chrome Web Store listing information
- [Icon Guidelines](README_ICONS.md) - Icon creation guidelines

