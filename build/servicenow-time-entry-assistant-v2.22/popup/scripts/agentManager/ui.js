/**
 * UI rendering utilities for agent manager
 */

/**
 * Toggle the agent management UI visibility
 */
function toggleManagementUI() {
  const managementDiv = document.getElementById('agent-management');
  if (managementDiv) {
    const isVisible = managementDiv.classList.contains('visible');
    
    if (isVisible) {
      managementDiv.classList.remove('visible');
      setTimeout(() => {
        if (!managementDiv.classList.contains('visible')) {
          managementDiv.style.display = 'none';
        }
      }, 300);
    } else {
      managementDiv.style.display = 'block';
      void managementDiv.offsetHeight;
      managementDiv.classList.add('visible');
      loadAndRenderAgents();
    }
  }
}

/**
 * Load agents from storage and render them
 */
async function loadAndRenderAgents() {
  const agents = await getAllAgents();
  renderAgentList(agents);
  updateAgentSelectionIndicators();
}

