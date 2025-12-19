/**
 * Agent select dropdown population utilities
 */

/**
 * Populate agent select dropdown with agent names
 * @param {string[]} agents - Array of agent names
 */
function populateAgentSelect(agents) {
  const select = document.getElementById('taskmaster-agent-input');
  if (!select) return;

  const currentValue = select.value;

  select.innerHTML = '<option value="">Select agent</option>';

  agents.forEach(agent => {
    const option = document.createElement('option');
    option.value = agent;
    option.textContent = agent;
    select.appendChild(option);
  });

  if (currentValue && agents.includes(currentValue)) {
    select.value = currentValue;
  }
}



