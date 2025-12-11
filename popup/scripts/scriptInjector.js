/**
 * Script injection utilities for popup
 */

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
    
    const scriptsLoaded = await areScriptsAlreadyInjected(tabId);
    
    if (!scriptsLoaded) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: REQUIRED_FILES
      }, () => {
        if (chrome.runtime.lastError) {
          handleInjectionError(chrome.runtime.lastError);
          return;
        }
        executeFunction(tabId, funcExecutor, args);
      });
    } else {
      executeFunction(tabId, funcExecutor, args);
    }
  });
}
