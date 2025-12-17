/**
 * Injected script that runs in page context
 */

async function fillTimeInNestedFrame(timeValue, commentText) {
  window.DebugLogger.log('Starting fillTimeInNestedFrame...', window.location.href);
  return executeWithValidation(
    validateFormProcessing,
    (doc) => window.FormFiller.processIncidentForm(doc, timeValue, commentText)
  );
}

async function processAlertCleared() {
  window.DebugLogger.log('Starting processAlertCleared...', window.location.href);
  return executeWithValidation(
    validateAlertCleared,
    (doc) => window.FormFiller.processAlertCleared(doc)
  );
}

async function fillTimeInNestedFrameAndSave(timeValue, commentText) {
  window.DebugLogger.log('Starting fillTimeInNestedFrameAndSave...', window.location.href);
  const fillResult = await fillTimeInNestedFrame(timeValue, commentText);
  if (!fillResult.success) return fillResult;
  window.DebugLogger.log('✓ Time entry filled successfully, now clicking Save button...');
  return await clickSaveButton();
}

async function processMacdAssignment(agentName) {
  window.DebugLogger.log('Starting processMacdAssignment...', window.location.href);
  return executeWithValidation(
    validateMacdAssignment,
    (doc) => window.FormFiller.processMacdAssignment(doc, agentName)
  );
}

window.fillTimeInNestedFrame = fillTimeInNestedFrame;
window.processAlertCleared = processAlertCleared;
window.fillTimeInNestedFrameAndSave = fillTimeInNestedFrameAndSave;
window.processMacdAssignment = processMacdAssignment;
