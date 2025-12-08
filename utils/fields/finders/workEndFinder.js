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

