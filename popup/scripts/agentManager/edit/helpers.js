/**
 * Edit helper utilities
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



