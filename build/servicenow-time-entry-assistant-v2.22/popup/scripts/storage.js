/**
 * Storage utilities for popup
 */

// Storage keys
const STORAGE_KEY_TASKMASTER_AGENT = 'taskmasterAgent';
const STORAGE_KEY_MACD_AGENTS_CACHE = 'macdAgentsCache';
const STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP = 'macdAgentsCacheTimestamp';
const CACHE_EXPIRY_HOURS = 24;

/**
 * Generic helper for chrome.storage.local.set
 * @param {Object} data - Data to store
 * @returns {Promise<void>}
 */
function setStorageData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => resolve());
  });
}

/**
 * Generic helper for chrome.storage.local.get
 * @param {string|string[]} keys - Key(s) to retrieve
 * @returns {Promise<Object>} Retrieved data
 */
function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result));
  });
}
