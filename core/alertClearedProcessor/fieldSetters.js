/**
 * Field setters for alert cleared workflow
 */

const ALERT_TEXT = 'Alert cleared. Closing ticket.';

async function setWorkNotesField(doc, fieldsToUpdate) {
  const { field: workNotesField } = await window.FieldFinder.findWorkNotesField(doc);
  if (workNotesField) {
    window.setFieldValue(doc, workNotesField, 'work_notes', ALERT_TEXT);
    window.dispatchFieldEvents(workNotesField, ['input', 'change']);
    fieldsToUpdate.push(workNotesField);
  }
}

async function setStateField(doc, fieldsToUpdate) {
  const stateField = await window.FieldFinder.findStateField(doc);
  if (stateField) {
    window.setSelectFieldValue(doc, stateField, 'state', 
      o => o.text.toLowerCase().includes('resolved') || o.value === '6' || o.value === 'resolved', 
      '6');
    fieldsToUpdate.push(stateField);
  }
}

async function setResolutionCodeField(doc, fieldsToUpdate) {
  const resolutionCodeField = await window.FieldFinder.findResolutionCodeField(doc);
  if (resolutionCodeField) {
    window.setSelectFieldValue(doc, resolutionCodeField, 'close_code', 
      o => o.text.toLowerCase().includes('permanently'), 
      null);
    fieldsToUpdate.push(resolutionCodeField);
  }
}

async function setCloseNotesField(doc, fieldsToUpdate) {
  const closeNotesField = await window.FieldFinder.findCloseNotesField(doc);
  if (closeNotesField) {
    window.setFieldValue(doc, closeNotesField, 'close_notes', ALERT_TEXT);
    window.dispatchFieldEvents(closeNotesField, ['input', 'change', 'blur']);
    fieldsToUpdate.push(closeNotesField);
  }
}

