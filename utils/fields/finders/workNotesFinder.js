/**
 * Find work_notes field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<{field: HTMLElement|null, editable: HTMLElement|null}>} Object with field and editable element
 */
window.FieldFinder.findWorkNotesField = async function(doc) {
  let workNotesField = window.FieldFinder.querySelectorFirst(doc, [
    'textarea#activity-stream-textarea',
    'textarea[data-stream-text-input="work_notes"]',
    'textarea[ng-model*="inputTypeValue"]',
    'textarea[id*="activity-stream"][id*="work_notes"]',
    'textarea[id$=".work_notes"]',
    'textarea[id$="work_notes"]',
    'textarea[name$=".work_notes"]',
    'input[id$=".work_notes"]',
    'textarea[id*="work_notes"]',
    'input[id*="work_notes"]'
  ]);
  if (!workNotesField) {
    console.log('Waiting for work_notes field...');
    try {
      workNotesField = await window.FieldFinder.waitForElement(doc, 'textarea#activity-stream-textarea, textarea[data-stream-text-input="work_notes"], textarea[id$=".work_notes"], textarea[id*="work_notes"], input[id*="work_notes"]');
    } catch (e) {
      console.log('Could not find work_notes field:', e.message);
    }
  }
  console.log('Found work_notes:', workNotesField?.id, 'tag:', workNotesField?.tagName, 'has ng-model:', workNotesField?.getAttribute('ng-model'));

  // Also look for contenteditable rich text editor for work_notes
  let workNotesEditable = window.FieldFinder.querySelectorFirst(doc, [
    '[id*="work_notes"][contenteditable="true"]',
    '[contenteditable="true"][id*="work_notes"]'
  ]);
  if (workNotesEditable) {
    console.log('Found work_notes contenteditable element:', workNotesEditable.id || workNotesEditable.className);
  }

  return { field: workNotesField, editable: workNotesEditable };
};

