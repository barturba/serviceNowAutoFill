/**
 * UI rendering utilities for agent manager
 */

/**
 * Toggle the agent management UI visibility
 */
function toggleManagementUI() {
  const managementDiv = document.getElementById('agent-management');
  if (managementDiv) {
    const isVisible = managementDiv.classList.contains('visible');
    
    if (isVisible) {
      // Hide with transition
      managementDiv.classList.remove('visible');
      // After transition completes, hide display
      setTimeout(() => {
        if (!managementDiv.classList.contains('visible')) {
          managementDiv.style.display = 'none';
        }
      }, 300);
    } else {
      // Show with transition
      managementDiv.style.display = 'block';
      // Force reflow to ensure display is set before adding class
      void managementDiv.offsetHeight;
      managementDiv.classList.add('visible');
      // Load and render agents when opening
      loadAndRenderAgents();
    }
  }
}

/**
 * Select an agent in the dropdown
 * @param {string} agentName - Agent name to select
 */
async function selectAgent(agentName) {
  const select = document.getElementById('taskmaster-agent-input');
  if (select && agentName) {
    select.value = agentName;
    // Save the selection
    if (typeof saveTaskmasterAgent === 'function') {
      await saveTaskmasterAgent(agentName);
    }
    // Update visual indicators
    updateAgentSelectionIndicators();
  }
}

/**
 * Update visual indicators for selected agent
 */
function updateAgentSelectionIndicators() {
  const select = document.getElementById('taskmaster-agent-input');
  const selectedAgent = select ? select.value : '';
  
  // Update all agent list items
  document.querySelectorAll('.agent-list-item').forEach(item => {
    const agentName = item.dataset.agentName;
    if (agentName === selectedAgent && selectedAgent) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

/**
 * Create an agent list item element
 * @param {string} agent - Agent name
 * @param {number} index - Index in the list
 * @returns {HTMLElement} Agent item element
 */
function createAgentListItem(agent, index) {
  const agentItem = document.createElement('div');
  agentItem.className = 'agent-list-item';
  agentItem.dataset.agentName = agent;

  const agentNameSpan = document.createElement('span');
  agentNameSpan.className = 'agent-name';
  agentNameSpan.textContent = agent;
  agentNameSpan.id = `agent-name-${index}`;
  agentNameSpan.style.cursor = 'pointer';
  agentNameSpan.title = 'Click to select this agent';
  agentNameSpan.addEventListener('click', async (e) => {
    e.stopPropagation();
    await selectAgent(agent);
  });

  const editBtn = document.createElement('button');
  editBtn.className = 'agent-action-btn agent-edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.title = 'Edit agent name';
  editBtn.setAttribute('aria-label', `Edit agent ${agent}`);
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editAgent(agent, index);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'agent-action-btn agent-delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.title = 'Delete agent';
  deleteBtn.setAttribute('aria-label', `Delete agent ${agent}`);
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteAgent(agent);
  });

  agentItem.appendChild(agentNameSpan);
  agentItem.appendChild(editBtn);
  agentItem.appendChild(deleteBtn);
  
  // Check if this agent is currently selected
  const select = document.getElementById('taskmaster-agent-input');
  if (select && select.value === agent) {
    agentItem.classList.add('selected');
  }
  
  return agentItem;
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
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'agent-list-empty';
    emptyMessage.textContent = 'No agents added yet';
    container.appendChild(emptyMessage);
    return;
  }

  agents.forEach((agent, index) => {
    const agentItem = createAgentListItem(agent, index);
    container.appendChild(agentItem);
  });
}

/**
 * Load agents from storage and render them
 */
async function loadAndRenderAgents() {
  const agents = await getAllAgents();
  renderAgentList(agents);
  // Update visual indicators for selected agent
  updateAgentSelectionIndicators();
}

