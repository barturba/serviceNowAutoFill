/**
 * Alert cleared workflow processor
 */

async function processAlertCleared(doc) {
  const scrollPositions = window.saveScrollPositions(doc);
  const restoreScroll = () => window.restoreScrollPositions(doc, scrollPositions);
  const alertText = 'Alert cleared. Closing ticket.';

  try {
    const fieldsToUpdate = await window.fillTimeWorkedFields(doc, '15 minutes');
    const { field: workNotesField } = await window.FieldFinder.findWorkNotesField(doc);
    if (workNotesField) {
      window.setFieldValue(doc, workNotesField, 'work_notes', alertText);
      window.dispatchFieldEvents(workNotesField, ['input', 'change']);
      fieldsToUpdate.push(workNotesField);
    }

    const stateField = await window.FieldFinder.findStateField(doc);
    if (stateField) {
      window.setSelectFieldValue(doc, stateField, 'state', o => o.text.toLowerCase().includes('resolved') || o.value === '6' || o.value === 'resolved', '6');
      fieldsToUpdate.push(stateField);
    }

    const resolutionTab = window.findResolutionTab(doc);
    if (resolutionTab) await window.clickResolutionTab(resolutionTab, doc, restoreScroll);

    const resolutionCodeField = await window.FieldFinder.findResolutionCodeField(doc);
    if (resolutionCodeField) {
      window.setSelectFieldValue(doc, resolutionCodeField, 'close_code', o => o.text.toLowerCase().includes('permanently'), null);
      fieldsToUpdate.push(resolutionCodeField);
    }

    const closeNotesField = await window.FieldFinder.findCloseNotesField(doc);
    if (closeNotesField) {
      window.setFieldValue(doc, closeNotesField, 'close_notes', alertText);
      window.dispatchFieldEvents(closeNotesField, ['input', 'change', 'blur']);
      fieldsToUpdate.push(closeNotesField);
    }

    fieldsToUpdate.forEach(field => window.dispatchFieldEvents(field, ['input', 'change']));
    restoreScroll();
    await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_ALERT_CLEARED));
    restoreScroll();
    return { success: true };
  } catch (error) {
    restoreScroll();
    return { success: false, error: error.message };
  }
}

window.FormFiller = window.FormFiller || {};
window.FormFiller.processAlertCleared = processAlertCleared;

