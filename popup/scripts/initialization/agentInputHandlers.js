/**
 * Agent input event handler setup functions
 */

function handleAddAgent(input) {
  return async () => {
    const agentName = input.value.trim();
    if (agentName) {
      const success = await addAgent(agentName);
      if (success) input.value = '';
    }
  };
}

function setupAddAgentButton() {
  const addAgentBtn = document.getElementById('add-agent-btn');
  const newAgentInput = document.getElementById('new-agent-input');
  if (addAgentBtn && newAgentInput) {
    const addHandler = handleAddAgent(newAgentInput);
    addAgentBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await addHandler();
    });

    newAgentInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        await addHandler();
      }
    });
  }
}

function setupAgentSelectHandler() {
  const agentSelect = document.getElementById('taskmaster-agent-input');
  if (agentSelect) {
    agentSelect.addEventListener('change', async (e) => {
      const selectedAgent = e.target.value;
      if (selectedAgent && typeof saveTaskmasterAgent === 'function') {
        await saveTaskmasterAgent(selectedAgent);
      }
      if (typeof updateAgentSelectionIndicators === 'function') {
        updateAgentSelectionIndicators();
      }
    });
  }
}

