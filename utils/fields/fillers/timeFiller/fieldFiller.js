/**
 * Time field filling utilities
 */

async function populateTimeFields(timeFields, hours, mins, secs, durationSeconds) {
  timeFields.hourInput.value = hours;
  timeFields.minInput.value = mins;
  timeFields.secInput.value = secs;
  timeFields.hiddenTime.value = `${hours}:${mins}:${secs}`;

  const now = new Date();
  const startTime = new Date(now.getTime() - durationSeconds * 1000);
  const fieldsToUpdate = [
    timeFields.hourInput, timeFields.minInput, 
    timeFields.secInput, timeFields.hiddenTime
  ];

  return { fieldsToUpdate, now, startTime };
}

window.populateTimeFields = populateTimeFields;

