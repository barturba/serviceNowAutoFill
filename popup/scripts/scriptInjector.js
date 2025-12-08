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
 * Inject scripts and execute a function
 * @param {string} funcName - Name of function to call (e.g., 'fillTimeInNestedFrame')
 * @param {Function} funcExecutor - Function to execute in page context
 * @param {Array} args - Arguments to pass to the function
 */
function injectAndExecute(funcName, funcExecutor, args = []) {
  // Clear any previous error messages
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.style.display = 'none';
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId },
      files: REQUIRED_FILES
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        showError('Error: ' + chrome.runtime.lastError.message);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId },
        func: funcExecutor,
        args: args
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          showError('Error: ' + chrome.runtime.lastError.message);
        } else if (results && results[0].result) {
          const result = results[0].result;
          if (result.success) {
            window.close();
          } else {
            showError('Failed: ' + (result.error || 'Unknown error'));
          }
        } else {
          window.close();
        }
      });
    });
  });
}

