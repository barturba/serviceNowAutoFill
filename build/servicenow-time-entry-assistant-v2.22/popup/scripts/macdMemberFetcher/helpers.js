/**
 * MACD member fetcher helper functions
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

