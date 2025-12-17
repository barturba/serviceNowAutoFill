/**
 * Agent Manager - Main entry point
 * Loads and exposes agent management functionality
 * 
 * This file serves as the entry point for agent management.
 * Individual modules are loaded via script tags in popup.html
 */

// All functions are defined in the module files:
// - validation.js: isDuplicate
// - messages.js: showAgentError, showAgentSuccess
// - ui.js: toggleManagementUI, renderAgentList, loadAndRenderAgents, createAgentListItem
// - crud.js: addAgent, updateAgent, deleteAgent
// - edit.js: editAgent, createAgentNameSpan, restoreAgentNameSpan

// Functions are available globally after modules are loaded
