/**
 * UI rendering utilities for agent manager
 */

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
 * Create an agent list item element
 * @param {string} agent - Agent name
 * @param {number} index - Index in the list
 * @returns {HTMLElement} Agent item element
 */
function createAgentListItem(agent, index) {
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
    container.innerHTML = '<div style="padding: 8px; color: #999; font-size: 11px; text-align: center;">No agents added yet</div>';
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

