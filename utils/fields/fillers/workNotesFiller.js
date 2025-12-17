/**
 * Fill work notes field utilities
 */

async function fillWorkNotes(doc, workNotesField, workNotesEditable, workNotesText) {
  const fieldsToUpdate = [];
  window.setWorkNotesViaGForm(doc, workNotesText);

  if (!workNotesField) {
    console.warn('⚠ work_notes field not found, skipping');
    if (workNotesEditable) window.fillContentEditable(workNotesEditable, workNotesText);
    return fieldsToUpdate;
  }

  const existingContent = workNotesField.value || '';
  const finalWorkNotesText = existingContent || workNotesText;
  window.setWorkNotesViaAngular(doc, workNotesField, finalWorkNotesText);

  await window.manipulateWorkNotesField(workNotesField, existingContent, finalWorkNotesText);
  fieldsToUpdate.push(workNotesField);

  if (workNotesEditable) {
    window.fillContentEditable(workNotesEditable, workNotesText);
  } else {
    window.fillContentEditableInWrapper(workNotesField, workNotesText);
  }

  return fieldsToUpdate;
}

window.fillWorkNotes = fillWorkNotes;
