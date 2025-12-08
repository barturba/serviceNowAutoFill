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

