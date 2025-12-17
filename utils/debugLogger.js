/**
 * Debug logging utility
 * Provides conditional logging that can be enabled/disabled
 */

// Check if debug mode is enabled (can be set in chrome.storage or localStorage)
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
    // Storage not available, default to false
    DEBUG_ENABLED = false;
  }
}

/**
 * Debug logging function - only logs when DEBUG_ENABLED is true
 * @param {...any} args - Arguments to log
 */
function debugLog(...args) {
  if (DEBUG_ENABLED) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Error logging function - always logs errors
 * @param {...any} args - Arguments to log
 */
function errorLog(...args) {
  console.error('[ERROR]', ...args);
}

/**
 * Warning logging function - always logs warnings
 * @param {...any} args - Arguments to log
 */
function warnLog(...args) {
  console.warn('[WARN]', ...args);
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

// Initialize on load
if (typeof chrome !== 'undefined' && chrome.storage) {
  initDebugMode();
}

// Make available globally for injected scripts
window.DebugLogger = {
  log: debugLog,
  error: errorLog,
  warn: warnLog,
  setDebugMode: setDebugMode,
  get isEnabled() {
    return DEBUG_ENABLED;
  }
};

