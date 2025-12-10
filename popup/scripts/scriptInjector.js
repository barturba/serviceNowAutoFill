/**
 * Script injection utilities for popup
 */

/**
 * Display error message in popup UI
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  } else {
    // Fallback to console if element not found
    console.error('Error:', message);
  }
}

/**
 * Clear error message display
 */
function clearError() {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}

/**
 * Handle script injection errors
 * @param {Error} error - Error object
 */
function handleInjectionError(error) {
  console.error(error);
  showError('Error: ' + (error.message || 'Unknown error'));
}

/**
 * Handle function execution result
 * @param {Object} result - Execution result
 */
function handleExecutionResult(result) {
  if (result && result.success) {
    window.close();
  } else {
    showError('Failed: ' + (result?.error || 'Unknown error'));
  }
}

/**
 * Inject scripts and execute a function
 * @param {string} funcName - Name of function to call (e.g., 'fillTimeInNestedFrame')
 * @param {Function} funcExecutor - Function to execute in page context
 * @param {Array} args - Arguments to pass to the function
 */
function injectAndExecute(funcName, funcExecutor, args = []) {
  clearError();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId },
      files: REQUIRED_FILES
    }, () => {
      if (chrome.runtime.lastError) {
        handleInjectionError(chrome.runtime.lastError);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId },
        func: funcExecutor,
        args: args
      }, (results) => {
        if (chrome.runtime.lastError) {
          handleInjectionError(chrome.runtime.lastError);
        } else if (results && results[0] && results[0].result) {
          handleExecutionResult(results[0].result);
        } else {
          window.close();
        }
      });
    });
  });
}
