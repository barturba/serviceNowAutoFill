/**
 * Alert cleared workflow processor
 */

/**
 * Process alert cleared workflow
 * @param {Document} doc - Document containing the form
 * @returns {Promise<Object>} Result object with success status
 */
async function processAlertCleared(doc) {
  const scrollPositions = window.saveScrollPositions(doc);
  const restoreScroll = () => window.restoreScrollPositions(doc, scrollPositions);

  try {
    const fieldsToUpdate = await window.fillTimeWorkedFields(doc, '15 minutes');
    
    await setWorkNotesField(doc, fieldsToUpdate);
    await setStateField(doc, fieldsToUpdate);
    
    const resolutionTab = window.findResolutionTab(doc);
    if (resolutionTab) {
      await window.clickResolutionTab(resolutionTab, doc, restoreScroll);
    }
    
    await setResolutionCodeField(doc, fieldsToUpdate);
    await setCloseNotesField(doc, fieldsToUpdate);

    fieldsToUpdate.forEach(field => window.dispatchFieldEvents(field, ['input', 'change']));
    restoreScroll();
    await window.delay(window.TimingConstants.DELAY_ALERT_CLEARED);
    restoreScroll();
    return { success: true };
  } catch (error) {
    restoreScroll();
    return { success: false, error: error.message };
  }
}

window.FormFiller = window.FormFiller || {};
window.FormFiller.processAlertCleared = processAlertCleared;
