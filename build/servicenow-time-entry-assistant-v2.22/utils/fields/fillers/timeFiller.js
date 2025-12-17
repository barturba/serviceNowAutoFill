/**
 * Time filling utilities for alert cleared workflow
 */

function fillTimeFields(doc, timeValue) {
  const durationSeconds = window.TimeParser.parseDuration(timeValue);
  const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = '00';
  
  return { durationSeconds, hours, mins, secs };
}

async function fillTimeWorkedFields(doc, timeValue) {
  const { durationSeconds, hours, mins, secs } = fillTimeFields(doc, timeValue);
  const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
  const startField = await window.FieldFinder.findWorkStartField(doc);
  const endField = await window.FieldFinder.findWorkEndField(doc);

  timeFields.hourInput.value = hours;
  timeFields.minInput.value = mins;
  timeFields.secInput.value = secs;
  timeFields.hiddenTime.value = `${hours}:${mins}:${secs}`;

  const now = new Date();
  const startTime = new Date(now.getTime() - durationSeconds * 1000);
  const fieldsToUpdate = [timeFields.hourInput, timeFields.minInput, timeFields.secInput, timeFields.hiddenTime];

  if (startField) {
    startField.value = window.TimeParser.formatDate(startTime);
    fieldsToUpdate.push(startField);
  }
  if (endField) {
    endField.value = window.TimeParser.formatDate(now);
    fieldsToUpdate.push(endField);
  }

  return fieldsToUpdate;
}

// Make available globally
window.fillTimeWorkedFields = fillTimeWorkedFields;

