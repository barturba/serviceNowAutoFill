/**
 * Contenteditable element helper utilities
 */

function fillContentEditable(editableElement, workNotesText) {
  const existingContent = (editableElement.textContent || editableElement.innerText || '').trim();
  if (existingContent) return;

  editableElement.focus();
  editableElement.textContent = workNotesText;
  editableElement.innerHTML = workNotesText;
  ['focus', 'input', 'keydown', 'keyup', 'change', 'blur'].forEach(type => {
    editableElement.dispatchEvent(new Event(type, { bubbles: true }));
  });
}

function fillContentEditableInWrapper(workNotesField, workNotesText) {
  const parentEditor = workNotesField.closest('[id*="work_notes"]');
  if (!parentEditor || parentEditor === workNotesField) return;

  const editableContent = parentEditor.querySelector('[contenteditable="true"]');
  if (editableContent && !(editableContent.textContent || editableContent.innerText || '').trim()) {
    editableContent.focus();
    editableContent.textContent = workNotesText;
    editableContent.innerHTML = workNotesText;
    ['focus', 'input', 'change', 'blur'].forEach(type => {
      editableContent.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }
}

// Make available globally
window.fillContentEditable = fillContentEditable;
window.fillContentEditableInWrapper = fillContentEditableInWrapper;

