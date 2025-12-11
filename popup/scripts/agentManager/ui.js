/**
 * UI rendering utilities for agent manager
 */

/**
 * Toggle the agent management UI visibility
 */
function toggleManagementUI() {
  const managementDiv = document.getElementById('agent-management');
  if (managementDiv) {
    const isVisible = managementDiv.style.display === 'block';
    managementDiv.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      // Load and render agents when opening
      loadAndRenderAgents();
    }
  }
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

  const editBtn = document.createElement('button');
  editBtn.className = 'agent-action-btn agent-edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.title = 'Edit agent name';
  editBtn.setAttribute('aria-label', `Edit agent ${agent}`);
  editBtn.addEventListener('click', () => editAgent(agent, index));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'agent-action-btn agent-delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.title = 'Delete agent';
  deleteBtn.setAttribute('aria-label', `Delete agent ${agent}`);
  deleteBtn.addEventListener('click', () => deleteAgent(agent));

  agentItem.appendChild(agentNameSpan);
  agentItem.appendChild(editBtn);
  agentItem.appendChild(deleteBtn);
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
}

