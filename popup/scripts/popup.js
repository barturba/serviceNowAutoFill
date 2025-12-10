/**
 * Popup script for ServiceNow Time Entry Assistant
 * Main initialization file that coordinates setup
 */

// Initialize taskmaster agent dropdown and event handlers
(async () => {
  await initializeAgentDropdown();
  setupAgentEventHandlers();
})();

// Setup button handlers for time entry and workflows
setupButtonHandlers();
