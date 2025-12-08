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

