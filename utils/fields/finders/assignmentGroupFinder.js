/**
 * Find assignment_group field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The assignment_group field or null
 */
window.FieldFinder.findAssignmentGroupField = async function(doc) {
  let assignmentGroupField = doc.querySelector('select[id$=".assignment_group"]') ||
                            doc.querySelector('select[id$="assignment_group"]') ||
                            doc.querySelector('select[name$=".assignment_group"]') ||
                            doc.querySelector('select[id*="assignment_group"]') ||
                            doc.querySelector('input[id$=".assignment_group"]') ||
                            doc.querySelector('input[id*="assignment_group"]');
  if (!assignmentGroupField) {
    console.log('Waiting for assignment_group field...');
    try {
      assignmentGroupField = await window.FieldFinder.waitForElement(doc, 'select[id$=".assignment_group"], select[id$="assignment_group"], select[id*="assignment_group"], input[id*="assignment_group"]');
    } catch (e) {
      console.log('Could not find assignment_group field:', e.message);
    }
  }
  console.log('Found assignment_group:', assignmentGroupField?.id, 'tag:', assignmentGroupField?.tagName, 'type:', assignmentGroupField?.type);
  return assignmentGroupField;
};

