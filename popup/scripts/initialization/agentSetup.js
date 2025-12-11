/**
 * Agent setup and initialization
 */

/**
 * Populate agent select dropdown with agent names
 * @param {string[]} agents - Array of agent names
 */
function populateAgentSelect(agents) {
  const select = document.getElementById('taskmaster-agent-input');
  if (!select) return;

  // Get current selected value to preserve it
  const currentValue = select.value;

  // Clear existing options except the placeholder
  select.innerHTML = '<option value="">Select agent</option>';

  // Add agent options
  agents.forEach(agent => {
    const option = document.createElement('option');
    option.value = agent;
    option.textContent = agent;
    select.appendChild(option);
  });

  // Restore selection if it still exists
  if (currentValue && agents.includes(currentValue)) {
    select.value = currentValue;
  }
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
    populateAgentSelect(cache.agents);
  } else {
    // Use default list
    populateAgentSelect(defaultAgents);
    // Save defaults to cache
    await saveMacdAgentsCache(defaultAgents);
  }
}

/**
 * Initialize taskmaster agent dropdown
 */
async function initializeAgentDropdown() {
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
}

