/**
 * Script injection result handlers
 */

/**
 * Handle script injection errors
 * @param {Error} error - Error object
 */
function handleInjectionError(error) {
  console.error(error);
  showError('Error: ' + (error.message || 'Unknown error'));
}

/**
 * Handle function execution result
 * @param {Object} result - Execution result
 */
function handleExecutionResult(result) {
  if (result && result.success) {
    showSuccess('Operation completed successfully!');
    setTimeout(() => {
      window.close();
    }, 500);
  } else {
    showError('Failed: ' + (result?.error || 'Unknown error'));
  }
}
