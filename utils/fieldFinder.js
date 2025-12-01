/**
 * Field finding utilities for ServiceNow forms
 */

// Use global namespace for injected scripts
window.FieldFinder = window.FieldFinder || {};

/**
 * Wait for an element to appear in the document
 * @param {Document} doc - Document to search in
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Element>} The found element
 */
window.FieldFinder.waitForElement = async function(doc, selector, timeout = 10000) {
  return new Promise((resolveWait, rejectWait) => {
    const element = doc.querySelector(selector);
    if (element) {
      resolveWait(element);
      return;
    }
    const observer = new MutationObserver(() => {
      const element = doc.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolveWait(element);
      }
    });
    observer.observe(doc.body || doc.documentElement, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      rejectWait(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
};

/**
 * Find work_start field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_start field or null
 */
window.FieldFinder.findWorkStartField = async function(doc) {
  let startField = doc.querySelector('input[id$=".u_work_start"]:not([type="hidden"])') ||
                  doc.querySelector('input[id$="u_work_start"]:not([type="hidden"])') ||
                  doc.querySelector('input[name$=".u_work_start"]:not([type="hidden"])') ||
                  doc.querySelector('input[id*="work_start"]:not([type="hidden"])');
  if (!startField) {
    console.log('Waiting for work_start field...');
    try {
      startField = await window.FieldFinder.waitForElement(doc, 'input[id$=".u_work_start"]:not([type="hidden"]), input[id$="u_work_start"]:not([type="hidden"]), input[id*="work_start"]:not([type="hidden"])');
    } catch (e) {
      console.log('Could not find work_start input field:', e.message);
    }
  }
  console.log('Found work_start:', startField?.id, 'tag:', startField?.tagName, 'type:', startField?.type);
  return startField;
};

/**
 * Find work_end field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_end field or null
 */
window.FieldFinder.findWorkEndField = async function(doc) {
  let endField = doc.querySelector('input[id$=".u_work_end"]:not([type="hidden"])') ||
                doc.querySelector('input[id$="u_work_end"]:not([type="hidden"])') ||
                doc.querySelector('input[name$=".u_work_end"]:not([type="hidden"])') ||
                doc.querySelector('input[id*="work_end"]:not([type="hidden"])');
  if (!endField) {
    console.log('Waiting for work_end field...');
    try {
      endField = await window.FieldFinder.waitForElement(doc, 'input[id$=".u_work_end"]:not([type="hidden"]), input[id$="u_work_end"]:not([type="hidden"]), input[id*="work_end"]:not([type="hidden"])');
    } catch (e) {
      console.log('Could not find work_end input field:', e.message);
    }
  }
  console.log('Found work_end:', endField?.id, 'tag:', endField?.tagName, 'type:', endField?.type);
  return endField;
};

/**
 * Find work_notes field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<{field: HTMLElement|null, editable: HTMLElement|null}>} Object with field and editable element
 */
window.FieldFinder.findWorkNotesField = async function(doc) {
  let workNotesField = doc.querySelector('textarea#activity-stream-textarea') ||
                      doc.querySelector('textarea[data-stream-text-input="work_notes"]') ||
                      doc.querySelector('textarea[ng-model*="inputTypeValue"]') ||
                      doc.querySelector('textarea[id*="activity-stream"][id*="work_notes"]') ||
                      doc.querySelector('textarea[id$=".work_notes"]') ||
                      doc.querySelector('textarea[id$="work_notes"]') ||
                      doc.querySelector('textarea[name$=".work_notes"]') ||
                      doc.querySelector('input[id$=".work_notes"]') ||
                      doc.querySelector('textarea[id*="work_notes"]') ||
                      doc.querySelector('input[id*="work_notes"]');
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
  let workNotesEditable = doc.querySelector('[id*="work_notes"][contenteditable="true"]') ||
                          doc.querySelector('[contenteditable="true"][id*="work_notes"]');
  if (workNotesEditable) {
    console.log('Found work_notes contenteditable element:', workNotesEditable.id || workNotesEditable.className);
  }

  return { field: workNotesField, editable: workNotesEditable };
};

/**
 * Find work_type field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_type field or null
 */
window.FieldFinder.findWorkTypeField = async function(doc) {
  let workTypeField = doc.querySelector('select[id$=".u_work_type"]') ||
                     doc.querySelector('select[id$="u_work_type"]') ||
                     doc.querySelector('select[name$=".u_work_type"]') ||
                     doc.querySelector('select[id*="work_type"]') ||
                     doc.querySelector('input[id$=".u_work_type"]') ||
                     doc.querySelector('input[id$="u_work_type"]') ||
                     doc.querySelector('input[id*="work_type"]');
  if (!workTypeField) {
    console.log('Waiting for work_type field...');
    try {
      workTypeField = await window.FieldFinder.waitForElement(doc, 'select[id$=".u_work_type"], select[id$="u_work_type"], select[id*="work_type"], input[id*="work_type"]');
    } catch (e) {
      console.log('Could not find work_type field:', e.message);
    }
  }
  console.log('Found work_type:', workTypeField?.id, 'tag:', workTypeField?.tagName, 'type:', workTypeField?.type);
  return workTypeField;
};

/**
 * Find time_worked container and inputs
 * @param {Document} doc - Document to search
 * @returns {Promise<{container: HTMLElement, hourInput: HTMLElement, minInput: HTMLElement, secInput: HTMLElement, hiddenTime: HTMLElement}>}
 */
window.FieldFinder.findTimeWorkedFields = async function(doc) {
  let timeContainer = doc.querySelector('[id*="time_worked"]');
  if (!timeContainer) {
    console.log('time_worked not immediately found, waiting...');
    timeContainer = await window.FieldFinder.waitForElement(doc, 'input[id*="time_worked"], div[id*="time_worked"]');
  }
  console.log('Found time container:', timeContainer.id);

  // Find parent div if we got an input
  if (timeContainer.tagName === 'INPUT') {
    timeContainer = timeContainer.closest('div[id*="time_worked"]') || timeContainer.parentElement;
  }

  const timeInputs = timeContainer.querySelectorAll('input.form-control');
  console.log('Found time inputs:', timeInputs.length);
  if (timeInputs.length < 3) {
    throw new Error(`Expected 3 time inputs, found ${timeInputs.length}`);
  }
  const hourInput = timeInputs[0];
  const minInput = timeInputs[1];
  const secInput = timeInputs[2];

  // Find hidden time field
  const hiddenTime = doc.querySelector('[id$="time_worked"]') ||
                    doc.querySelector('input[name*="time_worked"]');
  if (!hiddenTime) throw new Error('Hidden time field not found');
  console.log('Found hidden time:', hiddenTime.id);

  return { container: timeContainer, hourInput, minInput, secInput, hiddenTime };
};

