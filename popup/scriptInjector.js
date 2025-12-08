/**
 * Script injection utilities for popup
 */

const REQUIRED_FILES = [
  'utils/parsers/timeParser.js',
  'utils/fields/fieldFinder.js',
  'utils/dom/iframeFinder.js',
  'utils/dom/injectValidator.js',
  'utils/actions/saveButtonHandler.js',
  'utils/fields/workNoteExtractor.js',
  'utils/fields/workNotesFiller.js',
  'utils/fields/workTypeFiller.js',
  'core/alertClearedProcessor.js',
  'core/formFiller.js',
  'content/inject.js'
];

/**
 * Inject scripts and execute a function
 * @param {string} funcName - Name of function to call (e.g., 'fillTimeInNestedFrame')
 * @param {Function} funcExecutor - Function to execute in page context
 * @param {Array} args - Arguments to pass to the function
 */
function injectAndExecute(funcName, funcExecutor, args = []) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId },
      files: REQUIRED_FILES
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        alert('Error: ' + chrome.runtime.lastError.message);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId },
        func: funcExecutor,
        args: args
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert('Error: ' + chrome.runtime.lastError.message);
        } else if (results && results[0].result) {
          const result = results[0].result;
          if (result.success) {
            window.close();
          } else {
            alert('Failed: ' + (result.error || 'Unknown error'));
          }
        } else {
          window.close();
        }
      });
    });
  });
}

