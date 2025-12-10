/**
 * Agent setup and initialization
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

