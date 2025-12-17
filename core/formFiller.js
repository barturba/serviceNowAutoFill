/**
 * Form filling utilities for ServiceNow incident forms
 */

window.FormFiller = window.FormFiller || {};

window.FormFiller.processIncidentForm = async function(doc, timeValue, commentText) {
  window.DebugLogger.log('=== PROCESSING INCIDENT FORM ===', doc.location.href);
  try {
    const durationSeconds = window.TimeParser.parseDuration(timeValue);
    if (durationSeconds <= 0) throw new Error('Invalid time value: ' + timeValue);

    const fields = await window.collectFormFields(doc);
    const { hours, mins, secs } = window.calculateTimeComponents(durationSeconds);
    const { now, startTime } = window.calculateTimeWindow(durationSeconds);
    
    fields.timeFields.hourInput.value = hours;
    fields.timeFields.minInput.value = mins;
    fields.timeFields.secInput.value = secs;
    fields.timeFields.hiddenTime.value = `${hours}:${mins}:${secs}`;

    const fieldsToUpdate = [
      fields.timeFields.hourInput, fields.timeFields.minInput, 
      fields.timeFields.secInput, fields.timeFields.hiddenTime
    ];

    if (fields.startField) {
      fields.startField.value = window.TimeParser.formatDate(startTime);
      fieldsToUpdate.push(fields.startField);
    }
    if (fields.endField) {
      fields.endField.value = window.TimeParser.formatDate(now);
      fieldsToUpdate.push(fields.endField);
    }

    const workNotesText = (commentText?.trim()) || window.getLastWorkNote(doc);
    fieldsToUpdate.push(...(await window.fillWorkNotes(
      doc, fields.workNotesField, fields.workNotesEditable, workNotesText
    )));
    fieldsToUpdate.push(...window.fillWorkType(doc, fields.workTypeField));

    window.dispatchFieldEvents(fieldsToUpdate, ['input', 'change', 'blur']);
    return { success: true };
  } catch (error) {
    return window.ErrorHandler.handleError(error, 'Processing incident form');
  }
};
