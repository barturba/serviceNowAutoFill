/**
 * Delete agent operation
 */

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
  
  const updatedAgents = await getAllAgents();
  if (typeof populateAgentSelect === 'function') {
    populateAgentSelect(updatedAgents);
  }
  
  await loadAndRenderAgents();
  
  const agentSelect = document.getElementById('taskmaster-agent-input');
  if (agentSelect && agentSelect.value === name) {
    agentSelect.value = '';
    await saveTaskmasterAgent('');
  }
  
  if (typeof updateAgentSelectionIndicators === 'function') {
    updateAgentSelectionIndicators();
  }
  
  showAgentSuccess('Agent deleted successfully');
  return true;
}
