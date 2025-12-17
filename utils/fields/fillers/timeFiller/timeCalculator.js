/**
 * Time calculation utilities
 */

function fillTimeFields(doc, timeValue) {
  const durationSeconds = window.TimeParser.parseDuration(timeValue);
  const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = '00';
  
  return { durationSeconds, hours, mins, secs };
}

window.fillTimeFields = fillTimeFields;

