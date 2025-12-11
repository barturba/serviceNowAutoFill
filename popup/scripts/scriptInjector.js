/**
 * Script injection utilities for popup
 */

/**
 * Display error message in popup UI with dismiss button
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    // Clear any existing dismiss button
    const existingDismiss = errorElement.querySelector('.message-dismiss');
    if (existingDismiss) {
      existingDismiss.remove();
    }
    
    errorElement.textContent = message;
    
    // Add dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'message-dismiss';
    dismissBtn.innerHTML = '×';
    dismissBtn.setAttribute('aria-label', 'Dismiss error message');
    dismissBtn.onclick = () => hideError();
    errorElement.appendChild(dismissBtn);
    
    errorElement.classList.add('show');
    
    // Auto-hide after 8 seconds (increased from 5)
    setTimeout(() => {
      hideError();
    }, 8000);
  } else {
    // Fallback to console if element not found
    console.error('Error:', message);
  }
}

/**
 * Hide error message display
 */
function hideError() {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.classList.remove('show');
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 300); // Wait for animation to complete
  }
}

/**
 * Display success message in popup UI
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    // Clear any existing dismiss button
    const existingDismiss = successElement.querySelector('.message-dismiss');
    if (existingDismiss) {
      existingDismiss.remove();
    }
    
    successElement.textContent = message;
    
    // Add dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'message-dismiss';
    dismissBtn.innerHTML = '×';
    dismissBtn.setAttribute('aria-label', 'Dismiss success message');
    dismissBtn.onclick = () => hideSuccess();
    successElement.appendChild(dismissBtn);
    
    successElement.style.display = 'block';
    successElement.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideSuccess();
    }, 3000);
  }
}

/**
 * Hide success message display
 */
function hideSuccess() {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.classList.remove('show');
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 300); // Wait for animation to complete
  }
}

/**
 * Clear error message display (backward compatibility)
 */
function clearError() {
  hideError();
  hideSuccess();
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
    showSuccess('Operation completed successfully!');
    // Close after a short delay to show success message
    setTimeout(() => {
      window.close();
    }, 500);
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
      // No result returned, assume success and show message before closing
      showSuccess('Operation completed successfully!');
      setTimeout(() => {
        window.close();
      }, 500);
    }
  });
}
