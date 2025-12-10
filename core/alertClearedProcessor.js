/**
 * Alert cleared workflow processor
 */

const ALERT_TEXT = 'Alert cleared. Closing ticket.';

/**
 * Set work notes field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @returns {Promise<void>}
 */
async function setWorkNotesField(doc, fieldsToUpdate) {
  const { field: workNotesField } = await window.FieldFinder.findWorkNotesField(doc);
  if (workNotesField) {
    window.setFieldValue(doc, workNotesField, 'work_notes', ALERT_TEXT);
    window.dispatchFieldEvents(workNotesField, ['input', 'change']);
    fieldsToUpdate.push(workNotesField);
  }
}

/**
 * Set state field to resolved
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @returns {Promise<void>}
 */
async function setStateField(doc, fieldsToUpdate) {
  const stateField = await window.FieldFinder.findStateField(doc);
  if (stateField) {
    window.setSelectFieldValue(doc, stateField, 'state', 
      o => o.text.toLowerCase().includes('resolved') || o.value === '6' || o.value === 'resolved', 
      '6');
    fieldsToUpdate.push(stateField);
  }
}

/**
 * Set resolution code field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @returns {Promise<void>}
 */
async function setResolutionCodeField(doc, fieldsToUpdate) {
  const resolutionCodeField = await window.FieldFinder.findResolutionCodeField(doc);
  if (resolutionCodeField) {
    window.setSelectFieldValue(doc, resolutionCodeField, 'close_code', 
      o => o.text.toLowerCase().includes('permanently'), 
      null);
    fieldsToUpdate.push(resolutionCodeField);
  }
}

/**
 * Set close notes field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @returns {Promise<void>}
 */
async function setCloseNotesField(doc, fieldsToUpdate) {
  const closeNotesField = await window.FieldFinder.findCloseNotesField(doc);
  if (closeNotesField) {
    window.setFieldValue(doc, closeNotesField, 'close_notes', ALERT_TEXT);
    window.dispatchFieldEvents(closeNotesField, ['input', 'change', 'blur']);
    fieldsToUpdate.push(closeNotesField);
  }
}

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
