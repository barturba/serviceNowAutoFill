/**
 * Button handler setup utilities
 */

/**
 * Get comment text from input field
 */
function getCommentText() {
  const commentInput = document.getElementById('additional-comments-input');
  return commentInput ? commentInput.value.trim() : '';
}

/**
 * Setup time button handler (blue buttons)
 */
function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    const timeValue = button.getAttribute('data-time');
    const commentText = getCommentText();
    
    injectAndExecute('fillTimeInNestedFrame', (timeValue, commentText) => {
      if (window.fillTimeInNestedFrame) {
        return window.fillTimeInNestedFrame(timeValue, commentText);
      }
      throw new Error('fillTimeInNestedFrame not found');
    }, [timeValue, commentText]);
  });
}

/**
 * Setup time-save button handler (green buttons)
 */
function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    const timeValue = button.getAttribute('data-time');
    const commentText = getCommentText();
    
    injectAndExecute('fillTimeInNestedFrameAndSave', (timeValue, commentText) => {
      if (window.fillTimeInNestedFrameAndSave) {
        return window.fillTimeInNestedFrameAndSave(timeValue, commentText);
      }
      throw new Error('fillTimeInNestedFrameAndSave not found');
    }, [timeValue, commentText]);
  });
}

/**
 * Setup alert cleared button handler
 */
function setupAlertClearedButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('processAlertCleared', () => {
      if (window.processAlertCleared) {
        return window.processAlertCleared();
      }
      throw new Error('processAlertCleared not found');
    });
  });
}

