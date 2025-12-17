/**
 * MACD member fetcher for popup
 * Fetches MACD assignment group members from ServiceNow page
 */

/**
 * Fetch MACD members from ServiceNow page
 * @returns {Promise<string[]>} Array of member display names
 */
async function fetchMacdMembersFromServiceNow() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error('No active tab found'));
        return;
      }

      const tab = tabs[0];
      if (!isValidServiceNowTab(tab)) {
        reject(new Error('Not on a ServiceNow page'));
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fetchMacdMembersInPageContext
      }, (results) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        handleExecutionResults(results, resolve, reject);
      });
    });
  });
}
