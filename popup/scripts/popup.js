/**
 * Popup script for ServiceNow Time Entry Assistant
 * Handles button clicks and injects form filling script into ServiceNow pages
 */

/**
 * Populate agent datalist with agent names
 * @param {string[]} agents - Array of agent names
 */
function populateAgentDatalist(agents) {
  const datalist = document.getElementById('agent-list');
  if (!datalist) return;

  // Clear existing options
  datalist.innerHTML = '';

  // Add new options
  agents.forEach(agent => {
    const option = document.createElement('option');
    option.value = agent;
    datalist.appendChild(option);
  });
}

/**
 * Load and populate MACD agents
 * Uses hardcoded list stored in cache - simple and reliable
 * Users can manually update the list by editing storage
 */
async function loadMacdAgents() {
  // Default list - can be updated via storage
  const defaultAgents = [
    'Al G.',
    'George M.',
    'Sally G.',
    'Alex P.'
  ];
  
  // Try to load from cache/storage first
  const cache = await loadMacdAgentsCache();
  if (cache && cache.agents && cache.agents.length > 0) {
    populateAgentDatalist(cache.agents);
  } else {
    // Use default list
    populateAgentDatalist(defaultAgents);
    // Save defaults to cache
    await saveMacdAgentsCache(defaultAgents);
  }
}

// Initialize taskmaster agent dropdown
(async () => {
  // Load agents list first
  await loadMacdAgents();

  // Load saved selected agent
  const agentInput = document.getElementById('taskmaster-agent-input');
  if (agentInput) {
    const savedAgent = await loadTaskmasterAgent();
    if (savedAgent) {
      agentInput.value = savedAgent;
    }
  }

  // Setup refresh button - reloads from cache
  const refreshBtn = document.getElementById('refresh-agents-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await loadMacdAgents(); // Reload from cache
    });
  }

  // Setup manage agents button - toggle management UI
  const manageAgentsBtn = document.getElementById('manage-agents-btn');
  if (manageAgentsBtn) {
    manageAgentsBtn.addEventListener('mouseenter', () => {
      manageAgentsBtn.style.background = '#5a6268';
    });
    manageAgentsBtn.addEventListener('mouseleave', () => {
      manageAgentsBtn.style.background = '#6c757d';
    });
    manageAgentsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleManagementUI();
    });
  }

  // Setup add agent button
  const addAgentBtn = document.getElementById('add-agent-btn');
  const newAgentInput = document.getElementById('new-agent-input');
  if (addAgentBtn && newAgentInput) {
    addAgentBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const agentName = newAgentInput.value.trim();
      if (agentName) {
        const success = await addAgent(agentName);
        if (success) {
          newAgentInput.value = ''; // Clear input on success
        }
      }
    });

    // Allow Enter key to add agent
    newAgentInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const agentName = newAgentInput.value.trim();
        if (agentName) {
          const success = await addAgent(agentName);
          if (success) {
            newAgentInput.value = ''; // Clear input on success
          }
        }
      }
    });
  }
})();

// Setup time buttons (blue buttons)
document.querySelectorAll('.time-btn').forEach(setupTimeButtonHandler);

// Setup time-save buttons (green buttons)
document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);

// Setup alert cleared button
document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);

// Setup MACD assignment button
document.querySelectorAll('.macd-assignment-btn').forEach(setupMacdAssignmentButtonHandler);
