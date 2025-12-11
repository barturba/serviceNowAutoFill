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
  
  // Update select dropdown
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(agents);
  }
  
  // Refresh agent list display and update badge
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
  
  // Update select dropdown
  const updatedAgents = await getAllAgents();
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(updatedAgents);
  }
  
  // Refresh agent list display and update badge
  await loadAndRenderAgents();
  
  // Update taskmaster select if it was set to the old name
  const agentSelect = document.getElementById('taskmaster-agent-input');
  if (agentSelect && agentSelect.value === oldName) {
    agentSelect.value = trimmedNewName;
    await saveTaskmasterAgent(trimmedNewName);
  }
  
  // Update visual indicators
  if (typeof updateAgentSelectionIndicators === 'function') {
    updateAgentSelectionIndicators();
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
  
  // Update select dropdown
  const updatedAgents = await getAllAgents();
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(updatedAgents);
  }
  
  // Refresh agent list display and update badge
  await loadAndRenderAgents();
  
  // Clear taskmaster select if it was set to the deleted agent
  const agentSelect = document.getElementById('taskmaster-agent-input');
  if (agentSelect && agentSelect.value === name) {
    agentSelect.value = '';
    await saveTaskmasterAgent('');
  }
  
  // Update visual indicators
  if (typeof updateAgentSelectionIndicators === 'function') {
    updateAgentSelectionIndicators();
  }
  
  showAgentSuccess('Agent deleted successfully');
  return true;
}

