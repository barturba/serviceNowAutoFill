/**
 * Response creators for error handling
 */

/**
 * Create standardized error response
 * @param {Error|string} error - Error object or message
 * @param {string} [context] - Additional context
 * @returns {ErrorResponse}
 */
function createError(error, context) {
  const message = error instanceof Error ? error.message : String(error);
  window.DebugLogger.error(context ? `${context}: ${message}` : message);
  
  return {
    success: false,
    error: message,
    ...(context && { context })
  };
}

/**
 * Create standardized success response
 * @param {string[]} [warnings] - Optional warnings
 * @param {*} [data] - Optional data
 * @returns {SuccessResponse}
 */
function createSuccess(warnings, data) {
  const response = { success: true };
  
  if (warnings && warnings.length > 0) {
    response.warnings = warnings;
    window.DebugLogger.warn('Completed with warnings:', warnings.join(', '));
  }
  
  if (data !== undefined) {
    response.data = data;
  }
  
  return response;
}

window.ErrorHandler = window.ErrorHandler || {};
window.ErrorHandler.createError = createError;
window.ErrorHandler.createSuccess = createSuccess;

