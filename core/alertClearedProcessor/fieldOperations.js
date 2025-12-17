/**
 * Field operations for alert cleared workflow
 */

async function performAlertClearedOperations(doc, fieldsToUpdate, restoreScroll) {
  await setWorkNotesField(doc, fieldsToUpdate);
  await setStateField(doc, fieldsToUpdate);
  
  const resolutionTab = window.findResolutionTab(doc);
  if (resolutionTab) {
    await window.clickResolutionTab(resolutionTab, doc, restoreScroll);
  }
  
  await setResolutionCodeField(doc, fieldsToUpdate);
  await setCloseNotesField(doc, fieldsToUpdate);
}

window.performAlertClearedOperations = performAlertClearedOperations;

