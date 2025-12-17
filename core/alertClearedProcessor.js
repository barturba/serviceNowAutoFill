/**
 * Alert cleared workflow processor
 */

async function processAlertCleared(doc) {
  const scrollPositions = window.saveScrollPositions(doc);
  const restoreScroll = () => window.restoreScrollPositions(doc, scrollPositions);

  try {
    const fieldsToUpdate = await window.fillTimeWorkedFields(doc, '15 minutes');
    
    await window.performAlertClearedOperations(doc, fieldsToUpdate, restoreScroll);

    window.dispatchFieldEvents(fieldsToUpdate, ['input', 'change']);
    restoreScroll();
    await window.delay(window.TimingConstants.DELAY_ALERT_CLEARED);
    restoreScroll();
    return window.ErrorHandler.createSuccess();
  } catch (error) {
    restoreScroll();
    return window.ErrorHandler.handleError(error, 'Alert cleared workflow');
  }
}

window.FormFiller = window.FormFiller || {};
window.FormFiller.processAlertCleared = processAlertCleared;
