/**
 * Time filling utilities for alert cleared workflow
 */

async function fillTimeWorkedFields(doc, timeValue) {
  const { durationSeconds, hours, mins, secs } = window.fillTimeFields(doc, timeValue);
  const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
  const startField = await window.FieldFinder.findWorkStartField(doc);
  const endField = await window.FieldFinder.findWorkEndField(doc);

  const { fieldsToUpdate, now, startTime } = await window.populateTimeFields(
    timeFields, hours, mins, secs, durationSeconds
  );

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

window.fillTimeWorkedFields = fillTimeWorkedFields;
