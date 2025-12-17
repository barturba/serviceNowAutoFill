/**
 * Agent management storage utilities
 */

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

