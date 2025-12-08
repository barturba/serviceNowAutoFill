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
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!existingContent) {
    try {
      workNotesField.select();
      document.execCommand('insertText', false, finalWorkNotesText);
    } catch (e) {
      console.log('execCommand failed:', e.message);
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

