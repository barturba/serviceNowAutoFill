/**
 * Button handler setup functions
 */

/**
 * Setup all button handlers for time entry and workflows
 * This orchestrator function registers event listeners for all button types
 */
function setupButtonHandlers() {
  document.querySelectorAll('.time-btn').forEach(setupTimeButtonHandler);
  document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);
  document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);
}

function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrame', 
        (tv, ct) => window.fillTimeInNestedFrame?.(tv, ct) || 
          Promise.reject(new Error('fillTimeInNestedFrame not found')),
        [button.getAttribute('data-time'), getCommentText()]);
    }, button);
  });
}

function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrameAndSave',
        (tv, ct) => window.fillTimeInNestedFrameAndSave?.(tv, ct) ||
          Promise.reject(new Error('fillTimeInNestedFrameAndSave not found')),
        [button.getAttribute('data-time'), getCommentText()]);
    }, button);
  });
}

function setupAlertClearedButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('processAlertCleared',
        () => window.processAlertCleared?.() || Promise.reject(new Error('processAlertCleared not found')));
    }, button);
  });
}
