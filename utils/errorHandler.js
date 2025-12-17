/**
 * Centralized error handling utilities
 * Provides consistent error responses
 */

window.ErrorHandler = window.ErrorHandler || {};

/**
 * Handle caught error and return standardized response
 * @param {Error} error - Caught error
 * @param {string} context - Context where error occurred
 * @returns {ErrorResponse}
 */
window.ErrorHandler.handleError = function(error, context) {
  return window.ErrorHandler.createError(error, context);
};
