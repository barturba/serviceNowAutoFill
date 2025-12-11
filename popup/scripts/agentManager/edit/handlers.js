/**
 * Edit handler functions
 */

/**
 * Create save edit handler
 * @param {string} currentName - Current agent name
 * @param {number} index - Index in the list
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} parent - Parent element
 * @returns {Function} Save handler function
 */
function createSaveEditHandler(currentName, index, input, parent) {
  return async () => {
    const newName = input.value.trim();
    if (newName === currentName) {
      restoreAgentNameSpan(currentName, index, input, parent);
      return;
    }
    
    const success = await updateAgent(currentName, newName);
    if (!success) {
      restoreAgentNameSpan(currentName, index, input, parent);
    }
  };
}

/**
 * Create cancel edit handler
 * @param {string} currentName - Current agent name
 * @param {number} index - Index in the list
 * @param {HTMLElement} input - Input element
 * @param {HTMLElement} parent - Parent element
 * @returns {Function} Cancel handler function
 */
function createCancelEditHandler(currentName, index, input, parent) {
  return () => {
    restoreAgentNameSpan(currentName, index, input, parent);
  };
}
