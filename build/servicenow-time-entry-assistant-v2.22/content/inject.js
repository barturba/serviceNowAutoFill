/**
 * Injected script that runs in page context
 */

async function fillTimeInNestedFrame(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrame...', window.location.href);
  return executeWithValidation(
    validateFormProcessing,
    (doc) => window.FormFiller.processIncidentForm(doc, timeValue, commentText)
  );
}

async function processAlertCleared() {
  console.log('Starting processAlertCleared...', window.location.href);
  return executeWithValidation(
    validateAlertCleared,
    (doc) => window.FormFiller.processAlertCleared(doc)
  );
}

async function fillTimeInNestedFrameAndSave(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrameAndSave...', window.location.href);
  const fillResult = await fillTimeInNestedFrame(timeValue, commentText);
  if (!fillResult.success) return fillResult;
  console.log('✓ Time entry filled successfully, now clicking Save button...');
  return await clickSaveButton();
}

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
