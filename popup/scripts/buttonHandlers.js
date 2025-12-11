/**
 * Button handler setup utilities
 */

// Track if an operation is in progress to prevent multiple simultaneous operations
let isOperationInProgress = false;

/**
 * Debounce wrapper to prevent multiple simultaneous operations
 * @param {Function} fn - Function to execute
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {Function} Debounced function
 */
function debounce(fn, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Set loading state on a button
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Whether button should be in loading state
 */
function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

/**
 * Execute operation with progress tracking to prevent simultaneous operations
 * @param {Function} operation - Operation to execute
 * @param {HTMLElement} button - Button element to show loading state on
 */
async function executeWithProgressTracking(operation, button) {
  if (isOperationInProgress) {
    console.log('Operation already in progress, ignoring click');
    return;
  }
  
  try {
    isOperationInProgress = true;
    if (button) {
      setButtonLoading(button, true);
    }
    await operation();
  } finally {
    if (button) {
      setButtonLoading(button, false);
    }
    // Reset after a short delay to allow UI to update
    setTimeout(() => {
      isOperationInProgress = false;
    }, 100);
  }
}

function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrame', 
        (timeValue, commentText) => window.fillTimeInNestedFrame?.(timeValue, commentText) || 
          Promise.reject(new Error('fillTimeInNestedFrame not found')),
        [button.getAttribute('data-time'), getCommentText()]);
    }, button);
  });
}

function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrameAndSave',
        (timeValue, commentText) => window.fillTimeInNestedFrameAndSave?.(timeValue, commentText) ||
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

function setupMacdAssignmentButtonHandler(button) {
  button.addEventListener('click', async () => {
    await executeWithProgressTracking(async () => {
      const agentInput = document.getElementById('taskmaster-agent-input');
      const agentName = agentInput ? agentInput.value.trim() : '';
      
      if (!agentName) {
        showError('Please select or enter a taskmaster agent');
        return;
      }

      // Save the agent selection
      await saveTaskmasterAgent(agentName);

      injectAndExecute('processMacdAssignment',
        (agentName) => window.processMacdAssignment?.(agentName) || Promise.reject(new Error('processMacdAssignment not found')),
        [agentName]);
    }, button);
  });
}

