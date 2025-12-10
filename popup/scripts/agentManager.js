/**
 * Agent Manager - CRUD operations for taskmaster agents
 */

/**
 * Check if agent name is a duplicate (case-insensitive)
 * @param {string} name - Agent name to check
 * @param {string[]} agents - Current list of agents
 * @returns {boolean} True if duplicate exists
 */
function isDuplicate(name, agents) {
  if (!name || !agents) return false;
  return agents.some(agent => agent.toLowerCase() === name.trim().toLowerCase());
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }
}

/**
 * Show success message (brief visual feedback)
 * @param {string} message - Success message
 */
function showSuccess(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.backgroundColor = '#d4edda';
    errorDiv.style.color = '#155724';
    errorDiv.style.borderColor = '#c3e6cb';
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
      // Reset to error styling
      errorDiv.style.backgroundColor = '#f8d7da';
      errorDiv.style.color = '#721c24';
      errorDiv.style.borderColor = '#f5c6cb';
    }, 2000);
  }
}

/**
 * Toggle the agent management UI visibility
 */
function toggleManagementUI() {
  const managementDiv = document.getElementById('agent-management');
  if (managementDiv) {
    const isVisible = managementDiv.style.display !== 'none';
    managementDiv.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      // Load and render agents when opening
      loadAndRenderAgents();
    }
  }
}

/**
 * Render the agent list in the UI
 * @param {string[]} agents - Array of agent names
 */
function renderAgentList(agents) {
  const container = document.getElementById('agent-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (agents.length === 0) {
    container.innerHTML = '<div style="padding: 8px; color: #999; font-size: 11px; text-align: center;">No agents added yet</div>';
    return;
  }

  agents.forEach((agent, index) => {
    const agentItem = document.createElement('div');
    agentItem.style.cssText = 'display: flex; align-items: center; gap: 4px; padding: 6px 4px; border-bottom: 1px solid #eee;';
    agentItem.dataset.agentName = agent;

    const agentNameSpan = document.createElement('span');
    agentNameSpan.textContent = agent;
    agentNameSpan.style.cssText = 'flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    agentNameSpan.id = `agent-name-${index}`;

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.title = 'Edit agent name';
    editBtn.style.cssText = 'padding: 2px 6px; font-size: 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; white-space: nowrap; transition: background 0.2s;';
    editBtn.addEventListener('mouseenter', () => { editBtn.style.background = '#0056b3'; });
    editBtn.addEventListener('mouseleave', () => { editBtn.style.background = '#007bff'; });
    editBtn.addEventListener('click', () => editAgent(agent, index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.title = 'Delete agent';
    deleteBtn.style.cssText = 'padding: 2px 6px; font-size: 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; white-space: nowrap; transition: background 0.2s;';
    deleteBtn.addEventListener('mouseenter', () => { deleteBtn.style.background = '#c82333'; });
    deleteBtn.addEventListener('mouseleave', () => { deleteBtn.style.background = '#dc3545'; });
    deleteBtn.addEventListener('click', () => deleteAgent(agent));

    agentItem.appendChild(agentNameSpan);
    agentItem.appendChild(editBtn);
    agentItem.appendChild(deleteBtn);
    container.appendChild(agentItem);
  });
}

/**
 * Load agents from storage and render them
 */
async function loadAndRenderAgents() {
  const agents = await getAllAgents();
  renderAgentList(agents);
}

/**
 * Add a new agent
 * @param {string} name - Agent name to add
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function addAgent(name) {
  if (!name || !name.trim()) {
    showError('Agent name cannot be empty');
    return false;
  }

  const trimmedName = name.trim();
  const agents = await getAllAgents();

  if (isDuplicate(trimmedName, agents)) {
    showError('Agent already exists');
    return false;
  }

  agents.push(trimmedName);
  await saveMacdAgentsCache(agents);
  
  // Update datalist
  populateAgentDatalist(agents);
  
  // Refresh agent list display
  await loadAndRenderAgents();
  
  showSuccess('Agent added successfully');
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
    showError('Agent name cannot be empty');
    return false;
  }

  const trimmedNewName = newName.trim();
  const agents = await getAllAgents();

  // Check if new name is duplicate (excluding the current agent)
  const otherAgents = agents.filter(agent => agent.toLowerCase() !== oldName.toLowerCase());
  if (isDuplicate(trimmedNewName, otherAgents)) {
    showError('Agent name already exists');
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
  
  showSuccess('Agent updated successfully');
  return true;
}

/**
 * Delete an agent
 * @param {string} name - Agent name to delete
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function deleteAgent(name) {
  if (!name) {
    showError('Agent name is required');
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
  
  showSuccess('Agent deleted successfully');
  return true;
}

/**
 * Edit an agent inline
 * @param {string} currentName - Current agent name
 * @param {number} index - Index of the agent in the list
 */
function editAgent(currentName, index) {
  const agentNameSpan = document.getElementById(`agent-name-${index}`);
  if (!agentNameSpan) return;

  // Create input field
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.style.cssText = 'flex: 1; padding: 2px 4px; font-size: 11px; border: 1px solid #007bff; border-radius: 2px;';
  
  // Replace span with input
  const parent = agentNameSpan.parentElement;
  parent.replaceChild(input, agentNameSpan);
  
  // Focus and select
  input.focus();
  input.select();

  // Handle save on Enter or blur
  const saveEdit = async () => {
    const newName = input.value.trim();
    if (newName === currentName) {
      // No change, restore span
      const span = document.createElement('span');
      span.textContent = currentName;
      span.style.cssText = 'flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      span.id = `agent-name-${index}`;
      parent.replaceChild(span, input);
      return;
    }
    
    const success = await updateAgent(currentName, newName);
    if (!success) {
      // Restore original if update failed
      const span = document.createElement('span');
      span.textContent = currentName;
      span.style.cssText = 'flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      span.id = `agent-name-${index}`;
      parent.replaceChild(span, input);
    }
  };

  // Handle cancel on Escape
  const cancelEdit = () => {
    const span = document.createElement('span');
    span.textContent = currentName;
    span.style.cssText = 'flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    span.id = `agent-name-${index}`;
    parent.replaceChild(span, input);
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  });
}

