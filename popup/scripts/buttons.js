/**
 * Button orchestration for the popup
 */

let isOperationInProgress = false;

function getCommentText() {
  const commentInput = document.getElementById('additional-comments-input');
  return commentInput ? commentInput.value.trim() : '';
}

function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

async function executeWithProgressTracking(operation, button) {
  if (isOperationInProgress) {
    console.log('Operation already in progress, ignoring click');
    return;
  }

  try {
    isOperationInProgress = true;
    if (button) setButtonLoading(button, true);
    await operation();
  } finally {
    if (button) setButtonLoading(button, false);
    setTimeout(() => { isOperationInProgress = false; }, 100);
  }
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

function setupButtonHandlers() {
  document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);
  document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);
}

