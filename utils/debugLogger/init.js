/**
 * Debug mode initialization
 */

let DEBUG_ENABLED = false;

/**
 * Initialize debug mode from storage
 */
async function initDebugMode() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('debugMode');
      DEBUG_ENABLED = result.debugMode === true;
    }
  } catch (e) {
    DEBUG_ENABLED = false;
  }
}

/**
 * Enable or disable debug mode
 * @param {boolean} enabled - Whether to enable debug mode
 */
function setDebugMode(enabled) {
  DEBUG_ENABLED = enabled;
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ debugMode: enabled });
  }
}

function isDebugEnabled() {
  return DEBUG_ENABLED;
}

if (typeof chrome !== 'undefined' && chrome.storage) {
  initDebugMode();
}

window.DebugLogger = window.DebugLogger || {};
window.DebugLogger.setDebugMode = setDebugMode;
window.DebugLogger.isDebugEnabled = isDebugEnabled;

