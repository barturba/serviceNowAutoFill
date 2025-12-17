/**
 * Agent selection utilities
 */

/**
 * Select an agent in the dropdown
 * @param {string} agentName - Agent name to select
 */
async function selectAgent(agentName) {
  const select = document.getElementById('taskmaster-agent-input');
  if (select && agentName) {
    select.value = agentName;
    if (typeof saveTaskmasterAgent === 'function') {
      await saveTaskmasterAgent(agentName);
    }
    updateAgentSelectionIndicators();
  }
}

/**
 * Update visual indicators for selected agent
 */
function updateAgentSelectionIndicators() {
  const select = document.getElementById('taskmaster-agent-input');
  const selectedAgent = select ? select.value : '';
  
  document.querySelectorAll('.agent-list-item').forEach(item => {
    const agentName = item.dataset.agentName;
    if (agentName === selectedAgent && selectedAgent) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

