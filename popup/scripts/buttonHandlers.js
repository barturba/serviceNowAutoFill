/**
 * Button handler setup utilities
 */

/**
 * Setup all button handlers for time entry and workflows
 */
function setupButtonHandlers() {
  document.querySelectorAll('.time-btn').forEach(setupTimeButtonHandler);
  document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);
  document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);
  document.querySelectorAll('.macd-assignment-btn').forEach(setupMacdAssignmentButtonHandler);
  document.querySelectorAll('.open-stale-incidents-btn').forEach(setupOpenStaleIncidentsButtonHandler);
}

