/**
 * Field finding utilities for ServiceNow forms
 * Provides shared logging and error capture helpers.
 */

window.FieldFinder = window.FieldFinder || {};

function getLogger() {
  return window.DebugLogger || {};
}

function logDebug(...args) {
  const logger = getLogger();
  if (typeof logger.log === 'function') {
    logger.log(...args);
  } else {
    console.log(...args);
  }
}

function logWarn(...args) {
  const logger = getLogger();
  if (typeof logger.warn === 'function') {
    logger.warn(...args);
  } else {
    console.warn(...args);
  }
}

function logError(...args) {
  const logger = getLogger();
  if (typeof logger.error === 'function') {
    logger.error(...args);
  } else {
    console.error(...args);
  }
}

function captureException(error, context = {}) {
  try {
    if (window.Sentry && typeof window.Sentry.captureException === 'function') {
      window.Sentry.captureException(error, { extra: context });
    }
  } catch (_) {
    // Sentry capture should never break execution
  }
  logError('FieldFinder error', context, error);
}

window.FieldFinder.logDebug = logDebug;
window.FieldFinder.logWarn = logWarn;
window.FieldFinder.logError = logError;
window.FieldFinder.captureException = captureException;
