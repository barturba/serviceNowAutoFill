/**
 * Validation utilities for agent manager
 */

/**
 * Check if agent name is a duplicate (case-insensitive)
 * @param {string} name - Agent name to check
 * @param {string[]} agents - Current list of agents
 * @returns {boolean} True if duplicate exists
 */
function isDuplicate(name, agents) {
  if (!name || !agents) return false;
  return agents.some(agent => agent.toLowerCase() === name.trim().toLowerCase());
}




