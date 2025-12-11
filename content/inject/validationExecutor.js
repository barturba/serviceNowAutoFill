/**
 * Validation executor utility
 */

/**
 * Execute function with validation and error handling
 * @param {Function} validator - Validation function
 * @param {Function} executor - Function to execute
 * @returns {Promise<Object>} Result object
 */
async function executeWithValidation(validator, executor) {
  validator();
  try {
    const doc = await resolveDocument();
    return await executor(doc);
  } catch (error) {
    return { success: false, error: error.message };
  }
}
