/**
 * Button handler setup utilities
 */

function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('fillTimeInNestedFrame', 
      (timeValue, commentText) => window.fillTimeInNestedFrame?.(timeValue, commentText) || 
        Promise.reject(new Error('fillTimeInNestedFrame not found')),
      [button.getAttribute('data-time'), getCommentText()]);
  });
}

function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('fillTimeInNestedFrameAndSave',
      (timeValue, commentText) => window.fillTimeInNestedFrameAndSave?.(timeValue, commentText) ||
        Promise.reject(new Error('fillTimeInNestedFrameAndSave not found')),
      [button.getAttribute('data-time'), getCommentText()]);
  });
}

function setupAlertClearedButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('processAlertCleared',
      () => window.processAlertCleared?.() || Promise.reject(new Error('processAlertCleared not found')));
  });
}

