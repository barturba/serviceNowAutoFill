/**
 * Agent list rendering utilities
 */

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



