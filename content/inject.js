/**
 * Injected script that runs in page context
 * This script uses the injected utility modules to fill ServiceNow forms
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

/**
 * Fill time in nested frame
 * @param {string} timeValue - Time value to fill
 * @param {string} commentText - Comment text to fill
 * @returns {Promise<Object>} Result object
 */
async function fillTimeInNestedFrame(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrame...', window.location.href);
  return executeWithValidation(
    validateFormProcessing,
    (doc) => window.FormFiller.processIncidentForm(doc, timeValue, commentText)
  );
}

/**
 * Process alert cleared workflow
 * @returns {Promise<Object>} Result object
 */
async function processAlertCleared() {
  console.log('Starting processAlertCleared...', window.location.href);
  return executeWithValidation(
    validateAlertCleared,
    (doc) => window.FormFiller.processAlertCleared(doc)
  );
}

/**
 * Fill time and save
 * @param {string} timeValue - Time value to fill
 * @param {string} commentText - Comment text to fill
 * @returns {Promise<Object>} Result object
 */
async function fillTimeInNestedFrameAndSave(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrameAndSave...', window.location.href);
  const fillResult = await fillTimeInNestedFrame(timeValue, commentText);
  if (!fillResult.success) return fillResult;
  console.log('✓ Time entry filled successfully, now clicking Save button...');
  return await clickSaveButton();
}

/**
 * Process MACD assignment
 * @param {string} agentName - Agent name to assign
 * @returns {Promise<Object>} Result object
 */
async function processMacdAssignment(agentName) {
  console.log('Starting processMacdAssignment...', window.location.href);
  return executeWithValidation(
    validateMacdAssignment,
    (doc) => window.FormFiller.processMacdAssignment(doc, agentName)
  );
}

window.fillTimeInNestedFrame = fillTimeInNestedFrame;
window.processAlertCleared = processAlertCleared;
window.fillTimeInNestedFrameAndSave = fillTimeInNestedFrameAndSave;
window.processMacdAssignment = processMacdAssignment;
