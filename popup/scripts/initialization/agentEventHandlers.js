/**
 * Agent event handler setup functions
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
      await loadMacdAgents();
    });
  }
}

/**
 * Setup manage agents button handler
 */
function setupManageAgentsButton() {
  const manageAgentsBtn = document.getElementById('manage-agents-btn');
  if (manageAgentsBtn) {
    manageAgentsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleManagementUI();
    });
  }
}



