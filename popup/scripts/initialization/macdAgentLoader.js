/**
 * MACD agent loading utilities
 */

/**
 * Load and populate MACD agents
 * Uses hardcoded list stored in cache - simple and reliable
 * Users can manually update the list by editing storage
 */
async function loadMacdAgents() {
  const defaultAgents = [
    'Al G.',
    'George M.',
    'Sally G.',
    'Alex P.'
  ];
  
  const cache = await loadMacdAgentsCache();
  if (cache && cache.agents && cache.agents.length > 0) {
    populateAgentSelect(cache.agents);
  } else {
    populateAgentSelect(defaultAgents);
    await saveMacdAgentsCache(defaultAgents);
  }
}
