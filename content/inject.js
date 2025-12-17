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

async function fillTimeInNestedFrameAndSave(timeValue, commentText) {
  window.DebugLogger.log('Starting fillTimeInNestedFrameAndSave...', window.location.href);
  const fillResult = await fillTimeInNestedFrame(timeValue, commentText);
  if (!fillResult.success) return fillResult;
  window.DebugLogger.log('✓ Time entry filled successfully, now clicking Save button...');
  return await clickSaveButton();
}

window.fillTimeInNestedFrame = fillTimeInNestedFrame;
window.fillTimeInNestedFrameAndSave = fillTimeInNestedFrameAndSave;
