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

  workNotesField.click();
  workNotesField.focus();
  await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_FIELD_FOCUS));

  // Set field value directly (execCommand is deprecated, but preserve select() behavior for ServiceNow compatibility)
  if (!existingContent) {
    try {
      workNotesField.select();
    } catch (e) {
      // select() may fail on some field types, continue anyway
    }
  }
  workNotesField.value = existingContent || finalWorkNotesText;
  ['click', 'focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'].forEach(type => {
    workNotesField.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  });
  workNotesField.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: finalWorkNotesText }));
  fieldsToUpdate.push(workNotesField);

  if (workNotesEditable) {
    window.fillContentEditable(workNotesEditable, workNotesText);
  } else {
    window.fillContentEditableInWrapper(workNotesField, workNotesText);
  }

  return fieldsToUpdate;
}

// Make available globally
window.fillWorkNotes = fillWorkNotes;

