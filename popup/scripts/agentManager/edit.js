/**
 * Inline editing functionality for agent manager
 */

/**
 * Create a span element for agent name display
 * @param {string} name - Agent name
 * @param {number} index - Index in the list
 * @returns {HTMLElement} Span element
 */
function createAgentNameSpan(name, index) {
  const span = document.createElement('span');
  span.textContent = name;
  span.style.cssText = 'flex: 1; font-size: 11px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
  span.id = `agent-name-${index}`;
  return span;
}

/**
 * Restore agent name span after edit
 * @param {string} currentName - Agent name to restore
 * @param {number} index - Index in the list
 * @param {HTMLElement} input - Input element to replace
 * @param {HTMLElement} parent - Parent element
 */
function restoreAgentNameSpan(currentName, index, input, parent) {
  const span = createAgentNameSpan(currentName, index);
  parent.replaceChild(span, input);
}

/**
 * Edit an agent inline
 * @param {string} currentName - Current agent name
 * @param {number} index - Index of the agent in the list
 */
function editAgent(currentName, index) {
  const agentNameSpan = document.getElementById(`agent-name-${index}`);
  if (!agentNameSpan) return;

  // Create input field
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.style.cssText = 'flex: 1; padding: 2px 4px; font-size: 11px; border: 1px solid #007bff; border-radius: 2px;';
  
  // Replace span with input
  const parent = agentNameSpan.parentElement;
  parent.replaceChild(input, agentNameSpan);
  
  // Focus and select
  input.focus();
  input.select();

  // Handle save on Enter or blur
  const saveEdit = async () => {
    const newName = input.value.trim();
    if (newName === currentName) {
      // No change, restore span
      restoreAgentNameSpan(currentName, index, input, parent);
      return;
    }
    
    const success = await updateAgent(currentName, newName);
    if (!success) {
      // Restore original if update failed
      restoreAgentNameSpan(currentName, index, input, parent);
    }
  };

  // Handle cancel on Escape
  const cancelEdit = () => {
    restoreAgentNameSpan(currentName, index, input, parent);
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  });
}

