/**
 * Script injection utilities for the popup
 */

function handleInjectionError(error) {
  console.error(error);
  showError('Error: ' + (error?.message || 'Unknown error'));
}

function handleExecutionResult(result) {
  if (result && result.success) {
    showSuccess('Operation completed successfully!');
    setTimeout(() => { window.close(); }, 500);
  } else {
    showError('Failed: ' + (result?.error || 'Unknown error'));
  }
}

function executeFunction(tabId, funcExecutor, args = []) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: funcExecutor,
    args
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

async function injectAndExecute(funcName, funcExecutor, args = []) {
  clearMessages();

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

