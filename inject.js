/**
 * Injected script that runs in page context
 * This script uses the injected utility modules to fill ServiceNow forms
 */

async function fillTimeInNestedFrame(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrame...', window.location.href);
  validateFormProcessing();
  try {
    const doc = await resolveDocument();
    return await window.FormFiller.processIncidentForm(doc, timeValue, commentText);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function processAlertCleared() {
  console.log('Starting processAlertCleared...', window.location.href);
  validateAlertCleared();
  try {
    const doc = await resolveDocument();
    return await window.FormFiller.processAlertCleared(doc);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fillTimeInNestedFrameAndSave(timeValue, commentText) {
  console.log('Starting fillTimeInNestedFrameAndSave...', window.location.href);
  const fillResult = await fillTimeInNestedFrame(timeValue, commentText);
  if (!fillResult.success) return fillResult;
  console.log('✓ Time entry filled successfully, now clicking Save button...');
  return await clickSaveButton();
}

window.fillTimeInNestedFrame = fillTimeInNestedFrame;
window.processAlertCleared = processAlertCleared;
window.fillTimeInNestedFrameAndSave = fillTimeInNestedFrameAndSave;
