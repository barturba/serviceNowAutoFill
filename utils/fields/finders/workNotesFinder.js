/**
 * Find work_notes field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<{field: HTMLElement|null, editable: HTMLElement|null}>} Object with field and editable element
 */
window.FieldFinder.findWorkNotesField = async function(doc) {
  const fieldSelectors = [
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
  ];
  const editableSelectors = [
    '[id*="work_notes"][contenteditable="true"]',
    '[contenteditable="true"][id*="work_notes"]'
  ];

  try {
    let workNotesField = window.FieldFinder.querySelectorFirst(doc, fieldSelectors);

    if (!workNotesField) {
      window.FieldFinder.logDebug('Waiting for work_notes field...');
      try {
        workNotesField = await window.FieldFinder.waitForElement(doc, fieldSelectors.join(', '));
      } catch (error) {
        window.FieldFinder.logWarn('Could not find work_notes field:', error.message);
        window.FieldFinder.captureException(error, {
          finder: 'work_notes',
          selectors: fieldSelectors
        });
      }
    }

    window.FieldFinder.logDebug(
      'Found work_notes candidate:',
      workNotesField?.id,
      'tag:',
      workNotesField?.tagName,
      'has ng-model:',
      workNotesField?.getAttribute?.('ng-model')
    );

    const workNotesEditable = window.FieldFinder.querySelectorFirst(doc, editableSelectors);
    if (workNotesEditable) {
      window.FieldFinder.logDebug(
        'Found work_notes contenteditable element:',
        workNotesEditable.id || workNotesEditable.className
      );
    }

    return { field: workNotesField || null, editable: workNotesEditable || null };
  } catch (error) {
    window.FieldFinder.captureException(error, { finder: 'work_notes' });
    return { field: null, editable: null };
  }
};

