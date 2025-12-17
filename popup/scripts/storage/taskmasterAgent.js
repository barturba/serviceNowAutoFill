/**
 * Taskmaster agent storage utilities
 */

/**
 * Save taskmaster agent to chrome storage
 * @param {string} agentName - Agent name to save
 * @returns {Promise<void>}
 */
function saveTaskmasterAgent(agentName) {
  return setStorageData({ [STORAGE_KEY_TASKMASTER_AGENT]: agentName });
}

/**
 * Load taskmaster agent from chrome storage
 * @returns {Promise<string|null>} The saved agent name or null
 */
async function loadTaskmasterAgent() {
  const result = await getStorageData([STORAGE_KEY_TASKMASTER_AGENT]);
  return result[STORAGE_KEY_TASKMASTER_AGENT] || null;
}

