/**
 * Popup script for ServiceNow Time Entry Assistant
 * Handles button clicks and injects form filling script into ServiceNow pages
 */

// Setup time buttons (blue buttons)
document.querySelectorAll('.time-btn').forEach(setupTimeButtonHandler);

// Setup time-save buttons (green buttons)
document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);

// Setup alert cleared button
document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);
