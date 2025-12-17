/**
 * Field manipulation for work notes
 */

async function manipulateWorkNotesField(workNotesField, existingContent, finalWorkNotesText) {
  workNotesField.click();
  workNotesField.focus();
  await window.delay(window.TimingConstants.DELAY_FIELD_FOCUS);

  if (!existingContent) {
    try {
      workNotesField.select();
    } catch (e) {
      // select() may fail on some field types
    }
  }
  
  workNotesField.value = existingContent || finalWorkNotesText;
  window.dispatchWorkNotesEvents(workNotesField, finalWorkNotesText);
}

window.manipulateWorkNotesField = manipulateWorkNotesField;

