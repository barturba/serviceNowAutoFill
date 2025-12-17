/**
 * Centralized error handling utilities
 * Provides consistent error responses across the extension
 */

window.ErrorHandler = window.ErrorHandler || {};

/**
 * Standard error response format
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} error - Error message
 * @property {string} [context] - Additional context about where error occurred
 */

/**
 * Standard success response format
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success
 * @property {string[]} [warnings] - Optional warnings
 * @property {*} [data] - Optional data payload
 */

/**
 * Create standardized error response
 * @param {Error|string} error - Error object or message
 * @param {string} [context] - Additional context
 * @returns {ErrorResponse}
 */
window.ErrorHandler.createError = function(error, context) {
  const message = error instanceof Error ? error.message : String(error);
  window.DebugLogger.error(context ? `${context}: ${message}` : message);
  
  return {
    success: false,
    error: message,
    ...(context && { context })
  };
};

/**
 * Create standardized success response
 * @param {string[]} [warnings] - Optional warnings
 * @param {*} [data] - Optional data
 * @returns {SuccessResponse}
 */
window.ErrorHandler.createSuccess = function(warnings, data) {
  const response = { success: true };
  
  if (warnings && warnings.length > 0) {
    response.warnings = warnings;
    window.DebugLogger.warn('Completed with warnings:', warnings.join(', '));
  }
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
};

/**
 * Handle caught error and return standardized response
 * @param {Error} error - Caught error
 * @param {string} context - Context where error occurred
 * @returns {ErrorResponse}
 */
window.ErrorHandler.handleError = function(error, context) {
  return window.ErrorHandler.createError(error, context);
};

