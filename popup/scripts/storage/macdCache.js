/**
 * MACD agents cache storage utilities
 */

/**
 * Save MACD agents cache with timestamp
 * @param {string[]} agents - Array of agent names
 * @returns {Promise<void>}
 */
function saveMacdAgentsCache(agents) {
  const timestamp = Date.now();
  return setStorageData({
    [STORAGE_KEY_MACD_AGENTS_CACHE]: agents,
    [STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]: timestamp
  });
}

/**
 * Load MACD agents cache
 * @returns {Promise<{agents: string[], timestamp: number}|null>} Cached agents and timestamp, or null if not cached
 */
async function loadMacdAgentsCache() {
  const result = await getStorageData([
    STORAGE_KEY_MACD_AGENTS_CACHE,
    STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP
  ]);
  
  if (result[STORAGE_KEY_MACD_AGENTS_CACHE] && result[STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]) {
    return {
      agents: result[STORAGE_KEY_MACD_AGENTS_CACHE],
      timestamp: result[STORAGE_KEY_MACD_AGENTS_CACHE_TIMESTAMP]
    };
  }
  return null;
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



