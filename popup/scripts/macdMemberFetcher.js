/**
 * MACD member fetcher for popup
 * Fetches MACD assignment group members from ServiceNow page
 */

/**
 * Validate tab and URL for ServiceNow page
 * @param {Object} tab - Chrome tab object
 * @returns {boolean} True if valid ServiceNow tab
 */
function isValidServiceNowTab(tab) {
  return tab && tab.url && tab.url.includes('service-now.com');
}

/**
 * Handle script execution results
 * @param {Array} results - Execution results
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 */
function handleExecutionResults(results, resolve, reject) {
  if (results && results[0] && results[0].result) {
    const members = results[0].result;
    if (Array.isArray(members) && members.length > 0) {
      resolve(members);
    } else {
      reject(new Error('No MACD members found'));
    }
  } else {
    reject(new Error('Failed to fetch MACD members'));
  }
}

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

/**
 * Function that runs in ServiceNow page context to fetch MACD members
 * This is injected into the page - must be self-contained
 * Uses GlideRecord (server-side code available in page context, no API calls)
 * @returns {Promise<string[]>} Array of member display names
 */
function fetchMacdMembersInPageContext() {
  console.log('Fetching MACD members using GlideRecord...');
  
  try {
    if (typeof GlideRecord === 'undefined') {
      console.log('GlideRecord not available');
      return [];
    }
    
    // Get MS MACD group sys_id
    const grGroup = new GlideRecord('sys_user_group');
    grGroup.addQuery('name', 'MS MACD');
    grGroup.query();
    
    if (!grGroup.next()) {
      console.log('MS MACD group not found');
      return [];
    }
    
    const groupSysId = grGroup.getUniqueValue();
    console.log('Found MS MACD group:', groupSysId);
    
    // Get users in this group
    const grUser = new GlideRecord('sys_user');
    grUser.addQuery('assignment_group', groupSysId);
    grUser.addActiveQuery();
    grUser.query();
    
    const members = [];
    while (grUser.next()) {
      const name = grUser.getValue('name');
      if (name) {
        members.push(name);
      }
    }
    
    if (members.length > 0) {
      members.sort();
      console.log(`Found ${members.length} MACD members`);
      return members;
    }
    
    console.log('No members found');
    return [];
  } catch (e) {
    console.error('Error:', e.message || e);
    return [];
  }
}
