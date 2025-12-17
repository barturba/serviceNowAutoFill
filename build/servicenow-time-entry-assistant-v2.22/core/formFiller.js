/**
 * Form filling utilities for ServiceNow incident forms
 */

window.FormFiller = window.FormFiller || {};

window.FormFiller.processIncidentForm = async function(doc, timeValue, commentText) {
  console.log('=== PROCESSING INCIDENT FORM ===', doc.location.href);
  try {
    const durationSeconds = window.TimeParser.parseDuration(timeValue);
    if (durationSeconds <= 0) throw new Error('Invalid time value: ' + timeValue);

    const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
    const startField = await window.FieldFinder.findWorkStartField(doc);
    const endField = await window.FieldFinder.findWorkEndField(doc);
    const { field: workNotesField, editable: workNotesEditable } = await window.FieldFinder.findWorkNotesField(doc);
    const workTypeField = await window.FieldFinder.findWorkTypeField(doc);

    const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
    timeFields.hourInput.value = hours;
    timeFields.minInput.value = mins;
    timeFields.secInput.value = '00';
    timeFields.hiddenTime.value = `${hours}:${mins}:00`;

    const now = new Date();
    const startTime = new Date(now.getTime() - durationSeconds * 1000);
    const fieldsToUpdate = [timeFields.hourInput, timeFields.minInput, timeFields.secInput, timeFields.hiddenTime];

    if (startField) { startField.value = window.TimeParser.formatDate(startTime); fieldsToUpdate.push(startField); }
    if (endField) { endField.value = window.TimeParser.formatDate(now); fieldsToUpdate.push(endField); }

    const workNotesText = (commentText && commentText.trim()) ? commentText.trim() : window.getLastWorkNote(doc);
    fieldsToUpdate.push(...(await window.fillWorkNotes(doc, workNotesField, workNotesEditable, workNotesText)));
    fieldsToUpdate.push(...window.fillWorkType(doc, workTypeField));

    fieldsToUpdate.forEach(field => {
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
