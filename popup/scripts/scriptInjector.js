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
 * Check if scripts are already injected in the page
 * @param {number} tabId - Tab ID to check
 * @returns {Promise<boolean>} True if scripts are already loaded
 */
function areScriptsAlreadyInjected(tabId) {
  return new Promise((resolve) => {
    // Check for a key function that's always loaded after injection
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Check for multiple key functions/objects to be thorough
        return !!(window.fillTimeInNestedFrame && 
                  window.FormFiller && 
                  window.FieldFinder);
      }
    }, (results) => {
      // If there's an error or scripts aren't loaded, return false
      if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
        resolve(false);
      } else {
        resolve(results[0].result === true);
      }
    });
  });
}

/**
 * Inject scripts and execute a function
 * Optimized to check if scripts are already loaded before injecting
 * @param {string} funcName - Name of function to call (e.g., 'fillTimeInNestedFrame')
 * @param {Function} funcExecutor - Function to execute in page context
 * @param {Array} args - Arguments to pass to the function
 */
async function injectAndExecute(funcName, funcExecutor, args = []) {
  clearError();

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tabId = tabs[0].id;
    
    // Check if scripts are already injected to avoid redundant injection
    const scriptsLoaded = await areScriptsAlreadyInjected(tabId);
    
    if (!scriptsLoaded) {
      // Scripts not loaded, inject them
      chrome.scripting.executeScript({
        target: { tabId },
        files: REQUIRED_FILES
      }, () => {
        if (chrome.runtime.lastError) {
          handleInjectionError(chrome.runtime.lastError);
          return;
        }
        // Scripts injected, now execute the function
        executeFunction(tabId, funcExecutor, args);
      });
    } else {
      // Scripts already loaded, execute function directly
      executeFunction(tabId, funcExecutor, args);
    }
  });
}

/**
 * Execute a function in the page context
 * @param {number} tabId - Tab ID
 * @param {Function} funcExecutor - Function to execute in page context
 * @param {Array} args - Arguments to pass to the function
 */
function executeFunction(tabId, funcExecutor, args) {
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
}
