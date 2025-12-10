/**
 * CRUD operations for agent manager
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
  
  // Update datalist
  populateAgentDatalist(agents);
  
  // Refresh agent list display
  await loadAndRenderAgents();
  
  showAgentSuccess('Agent added successfully');
  return true;
}

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

  // Check if new name is duplicate (excluding the current agent)
  const otherAgents = agents.filter(agent => agent.toLowerCase() !== oldName.toLowerCase());
  if (isDuplicate(trimmedNewName, otherAgents)) {
    showAgentError('Agent name already exists');
    return false;
  }

  await updateAgentInStorage(oldName, trimmedNewName);
  
  // Update datalist
  const updatedAgents = await getAllAgents();
  populateAgentDatalist(updatedAgents);
  
  // Refresh agent list display
  await loadAndRenderAgents();
  
  // Update taskmaster input if it was set to the old name
  const agentInput = document.getElementById('taskmaster-agent-input');
  if (agentInput && agentInput.value === oldName) {
    agentInput.value = trimmedNewName;
    await saveTaskmasterAgent(trimmedNewName);
  }
  
  showAgentSuccess('Agent updated successfully');
  return true;
}

/**
 * Delete an agent
 * @param {string} name - Agent name to delete
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function deleteAgent(name) {
  if (!name) {
    showAgentError('Agent name is required');
    return false;
  }

  if (!confirm(`Are you sure you want to delete "${name}"?`)) {
    return false;
  }

  await removeAgentFromStorage(name);
  
  // Update datalist
  const updatedAgents = await getAllAgents();
  populateAgentDatalist(updatedAgents);
  
  // Refresh agent list display
  await loadAndRenderAgents();
  
  // Clear taskmaster input if it was set to the deleted agent
  const agentInput = document.getElementById('taskmaster-agent-input');
  if (agentInput && agentInput.value === name) {
    agentInput.value = '';
    await saveTaskmasterAgent('');
  }
  
  showAgentSuccess('Agent deleted successfully');
  return true;
}

