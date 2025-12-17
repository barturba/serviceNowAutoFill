/**
 * Add agent operation
 */

/**
 * Add a new agent
 * @param {string} name - Agent name to add
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function addAgent(name) {
  if (!name || !name.trim()) {
    showAgentError('Agent name cannot be empty');
    return false;
  }

  const trimmedName = name.trim();
  const agents = await getAllAgents();

  if (isDuplicate(trimmedName, agents)) {
    showAgentError('Agent already exists');
    return false;
  }

  agents.push(trimmedName);
  await saveMacdAgentsCache(agents);
  
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(agents);
  }
  
  await loadAndRenderAgents();
  
  showAgentSuccess('Agent added successfully');
  return true;
}

