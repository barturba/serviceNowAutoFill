/**
 * Find state field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The state field or null
 */
window.FieldFinder.findStateField = async function(doc) {
  let stateField = doc.querySelector('select[id$=".state"]') ||
                  doc.querySelector('select[id$="state"]') ||
                  doc.querySelector('select[name$=".state"]') ||
                  doc.querySelector('select[id*="state"]') ||
                  doc.querySelector('input[id$=".state"]') ||
                  doc.querySelector('input[id*="state"]');
  if (!stateField) {
    console.log('Waiting for state field...');
    try {
      stateField = await window.FieldFinder.waitForElement(doc, 'select[id$=".state"], select[id$="state"], select[id*="state"], input[id*="state"]');
    } catch (e) {
      console.log('Could not find state field:', e.message);
    }
  }
  console.log('Found state:', stateField?.id, 'tag:', stateField?.tagName, 'type:', stateField?.type);
  return stateField;
};

