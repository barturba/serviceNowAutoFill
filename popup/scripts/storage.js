/**
 * Storage utilities for popup
 */

const STORAGE_KEY_TASKMASTER_AGENT = 'taskmasterAgent';

/**
 * Save taskmaster agent to chrome storage
 * @param {string} agentName - Agent name to save
 * @returns {Promise<void>}
 */
function saveTaskmasterAgent(agentName) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY_TASKMASTER_AGENT]: agentName }, () => {
      resolve();
    });
  });
}

/**
 * Load taskmaster agent from chrome storage
 * @returns {Promise<string|null>} The saved agent name or null
 */
function loadTaskmasterAgent() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY_TASKMASTER_AGENT], (result) => {
      resolve(result[STORAGE_KEY_TASKMASTER_AGENT] || null);
    });
  });
}

