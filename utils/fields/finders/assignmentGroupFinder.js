/**
 * Find assignment_group field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The assignment_group field or null
 */
window.FieldFinder.findAssignmentGroupField = window.FieldFinder.createFieldFinder('assignment_group', [
  'select[id$=".assignment_group"]',
  'select[id$="assignment_group"]',
  'select[name$=".assignment_group"]',
  'select[id*="assignment_group"]',
  'input[id$=".assignment_group"]',
  'input[id*="assignment_group"]'
]);

