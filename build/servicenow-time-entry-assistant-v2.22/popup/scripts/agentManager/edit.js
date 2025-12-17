/**
 * Inline editing functionality for agent manager
 */

/**
 * Edit an agent inline
 * @param {string} currentName - Current agent name
 * @param {number} index - Index of the agent in the list
 */
function editAgent(currentName, index) {
  const agentNameSpan = document.getElementById(`agent-name-${index}`);
  if (!agentNameSpan) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.style.cssText = 'flex: 1; padding: 2px 4px; font-size: 11px; border: 1px solid #007bff; border-radius: 2px;';
  
  const parent = agentNameSpan.parentElement;
  parent.replaceChild(input, agentNameSpan);
  
  input.focus();
  input.select();

  const saveEdit = createSaveEditHandler(currentName, index, input, parent);
  const cancelEdit = createCancelEditHandler(currentName, index, input, parent);

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


