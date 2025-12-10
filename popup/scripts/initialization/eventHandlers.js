/**
 * Event handler setup for popup
 */

/**
 * Setup refresh agents button handler
 */
function setupRefreshAgentsButton() {
  const refreshBtn = document.getElementById('refresh-agents-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await loadMacdAgents(); // Reload from cache
    });
  }
}

/**
 * Setup manage agents button handler
 */
function setupManageAgentsButton() {
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
}

/**
 * Setup add agent button handler
 */
function setupAddAgentButton() {
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
}

/**
 * Setup all agent-related event handlers
 */
function setupAgentEventHandlers() {
  setupRefreshAgentsButton();
  setupManageAgentsButton();
  setupAddAgentButton();
}

/**
 * Setup all button handlers for time entry and workflows
 */
function setupButtonHandlers() {
  // Setup time buttons (blue buttons)
  document.querySelectorAll('.time-btn').forEach(setupTimeButtonHandler);

  // Setup time-save buttons (green buttons)
  document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);

  // Setup alert cleared button
  document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);

  // Setup MACD assignment button
  document.querySelectorAll('.macd-assignment-btn').forEach(setupMacdAssignmentButtonHandler);
}

