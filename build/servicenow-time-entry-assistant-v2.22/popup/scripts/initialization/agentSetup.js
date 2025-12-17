/**
 * Agent setup and initialization
 */

/**
 * Initialize taskmaster agent dropdown
 */
async function initializeAgentDropdown() {
  await loadMacdAgents();

  const agentInput = document.getElementById('taskmaster-agent-input');
  if (agentInput) {
    const savedAgent = await loadTaskmasterAgent();
    if (savedAgent) {
      agentInput.value = savedAgent;
    }
  }
}

