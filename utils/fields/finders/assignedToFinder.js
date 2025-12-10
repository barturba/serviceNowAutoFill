/**
 * Find assigned_to field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The assigned_to field or null
 */
window.FieldFinder.findAssignedToField = async function(doc) {
  let assignedToField = doc.querySelector('input[id$=".assigned_to"]') ||
                       doc.querySelector('input[id$="assigned_to"]') ||
                       doc.querySelector('input[name$=".assigned_to"]') ||
                       doc.querySelector('input[id*="assigned_to"]') ||
                       doc.querySelector('select[id$=".assigned_to"]') ||
                       doc.querySelector('select[id*="assigned_to"]');
  if (!assignedToField) {
    console.log('Waiting for assigned_to field...');
    try {
      assignedToField = await window.FieldFinder.waitForElement(doc, 'input[id$=".assigned_to"], input[id$="assigned_to"], input[id*="assigned_to"], select[id*="assigned_to"]');
    } catch (e) {
      console.log('Could not find assigned_to field:', e.message);
    }
  }
  console.log('Found assigned_to:', assignedToField?.id, 'tag:', assignedToField?.tagName, 'type:', assignedToField?.type);
  return assignedToField;
};

