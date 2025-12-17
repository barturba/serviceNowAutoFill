/**
 * Script injection helper functions
 */

function areScriptsAlreadyInjected(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return !!(window.fillTimeInNestedFrame && 
                  window.FormFiller && 
                  window.FieldFinder);
      }
    }, (results) => {
      if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
        resolve(false);
      } else {
        resolve(results[0].result === true);
      }
    });
  });
}

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
      showSuccess('Operation completed successfully!');
      setTimeout(() => { window.close(); }, 500);
    }
  });
}

