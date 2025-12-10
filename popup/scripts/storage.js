/**
 * Storage utilities for popup
 */

const STORAGE_KEY_TASKMASTER_AGENT = 'taskmasterAgent';
const STORAGE_KEY_MACD_AGENTS_CACHE = 'macdAgentsCache';
const STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP = 'macdAgentsCacheTimestamp';
const CACHE_EXPIRY_HOURS = 24;

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

/**
 * Save MACD agents cache with timestamp
 * @param {string[]} agents - Array of agent names
 * @returns {Promise<void>}
 */
function saveMacdAgentsCache(agents) {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    chrome.storage.local.set({
      [STORAGE_KEY_MACD_AGENTS_CACHE]: agents,
      [STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]: timestamp
    }, () => {
      resolve();
    });
  });
}

/**
 * Load MACD agents cache
 * @returns {Promise<{agents: string[], timestamp: number}|null>} Cached agents and timestamp, or null if not cached
 */
function loadMacdAgentsCache() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY_MACD_AGENTS_CACHE, STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP], (result) => {
      if (result[STORAGE_KEY_MACD_AGENTS_CACHE] && result[STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]) {
        resolve({
          agents: result[STORAGE_KEY_MACD_AGENTS_CACHE],
          timestamp: result[STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]
        });
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Check if MACD agents cache is expired
 * @param {number} timestamp - Cache timestamp
 * @returns {boolean} True if cache is expired
 */
function isMacdAgentsCacheExpired(timestamp) {
  const now = Date.now();
  const expiryMs = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
  return (now - timestamp) > expiryMs;
}

/**
 * Get all agents from storage
 * @returns {Promise<string[]>} Array of agent names
 */
async function getAllAgents() {
  const cache = await loadMacdAgentsCache();
  return cache && cache.agents ? cache.agents : [];
}

/**
 * Update agent name in storage
 * @param {string} oldName - Old agent name
 * @param {string} newName - New agent name
 * @returns {Promise<void>}
 */
async function updateAgentInStorage(oldName, newName) {
  const agents = await getAllAgents();
  const index = agents.findIndex(agent => agent.toLowerCase() === oldName.toLowerCase());
  if (index !== -1) {
    agents[index] = newName;
    await saveMacdAgentsCache(agents);
  }
}

/**
 * Remove agent from storage
 * @param {string} name - Agent name to remove
 * @returns {Promise<void>}
 */
async function removeAgentFromStorage(name) {
  const agents = await getAllAgents();
  const filteredAgents = agents.filter(agent => agent.toLowerCase() !== name.toLowerCase());
  await saveMacdAgentsCache(filteredAgents);
}

