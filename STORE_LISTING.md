# Chrome Web Store Listing Information

Use this information when uploading to Chrome Web Store to avoid manual entry.

---

## Basic Information

**Extension Name:**
```
ServiceNow Time Entry Assistant
```

**Summary / Short Description:** (114 characters)
```
One-click time entry for ServiceNow incidents and tasks. Choose 15min, 30min, 45min, 1hr, 1.5hr, or 2hr durations.
```

---

## Store Listing

**Category:**
```
Productivity
```

**Language:**
```
English (United States)
```

**Detailed Description:**
```
ServiceNow Time Entry Assistant streamlines time tracking for ServiceNow users by providing quick, one-click time entries.

KEY FEATURES:
• Quick time entry buttons: 15min, 30min, 45min, 1hr, 1.5hr, 2hr
• Automatically fills time_worked, work_start, work_end fields
• Preserves existing work notes
• Auto-populates work_type field
• Works with incidents, catalog tasks, and other ServiceNow tables
• Compatible with both classic and modern ServiceNow UIs

HOW IT WORKS:
1. Open any ServiceNow incident or task
2. Click the extension icon
3. Select your time duration
4. All time fields are automatically populated

SUPPORTED FIELDS:
• time_worked (hours:minutes:seconds)
• u_work_start (start timestamp)
• u_work_end (end timestamp)
• work_notes (preserves existing content)
• u_work_type (auto-selects appropriate type)

Perfect for ServiceNow administrators, technicians, and support staff who need to quickly log time entries without manual field entry.

Note: This extension only works on *.service-now.com domains.
```

---

## Privacy

**Single Purpose Description:**
```
Automate time entry form filling for ServiceNow incidents and tasks
```

**Permission Justifications:**

- **activeTab**: Required to access the currently active ServiceNow tab to fill time entry fields
- **scripting**: Required to inject scripts into ServiceNow pages to interact with form fields
- **webNavigation**: Required to detect when users navigate to ServiceNow incident/task pages
- **Host permission (*.service-now.com)**: Required to access and modify ServiceNow form fields

**Data Usage:**
```
This extension does not collect, store, or transmit any user data. All operations are performed locally in the browser on ServiceNow pages.
```

---

## Support & Distribution

**Website:**
```
https://github.com/barturba/serviceNowAutoFill
```

**Support Email:**
```
[Your email here]
```

**Visibility:**
```
Unlisted (or Private if using Google Workspace)
```

---

## Icons Needed

You'll need to create three icon files (PNG format):
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

Recommended: Simple clock or timer icon with ServiceNow colors (green/teal).

---

## Tags / Keywords (if prompted)

```
servicenow, time entry, productivity, automation, time tracking, incident management, itsm
```
