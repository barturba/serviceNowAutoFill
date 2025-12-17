/**
 * Logging functions
 */

function debugLog(...args) {
  if (window.DebugLogger.isDebugEnabled()) {
    console.log('[DEBUG]', ...args);
  }
}

function errorLog(...args) {
  console.error('[ERROR]', ...args);
}

function warnLog(...args) {
  console.warn('[WARN]', ...args);
}

window.DebugLogger = window.DebugLogger || {};
window.DebugLogger.log = debugLog;
window.DebugLogger.error = errorLog;
window.DebugLogger.warn = warnLog;
Object.defineProperty(window.DebugLogger, 'isEnabled', {
  get() {
    return window.DebugLogger.isDebugEnabled();
  }
});

