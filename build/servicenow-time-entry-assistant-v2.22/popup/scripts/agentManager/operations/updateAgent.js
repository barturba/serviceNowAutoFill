/**
 * Update agent operation
 */

/**
 * Update an existing agent
 * @param {string} oldName - Current agent name
 * @param {string} newName - New agent name
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function updateAgent(oldName, newName) {
  if (!newName || !newName.trim()) {
    showAgentError('Agent name cannot be empty');
    return false;
  }

  const trimmedNewName = newName.trim();
  const agents = await getAllAgents();

  const otherAgents = agents.filter(agent => agent.toLowerCase() !== oldName.toLowerCase());
  if (isDuplicate(trimmedNewName, otherAgents)) {
    showAgentError('Agent name already exists');
    return false;
  }

  await updateAgentInStorage(oldName, trimmedNewName);
  
  const updatedAgents = await getAllAgents();
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(updatedAgents);
  }
  
  await loadAndRenderAgents();
  
  const agentSelect = document.getElementById('taskmaster-agent-input');
  if (agentSelect && agentSelect.value === oldName) {
    agentSelect.value = trimmedNewName;
    await saveTaskmasterAgent(trimmedNewName);
  }
  
  if (typeof updateAgentSelectionIndicators === 'function') {
    updateAgentSelectionIndicators();
  }
  
  showAgentSuccess('Agent updated successfully');
  return true;
}

