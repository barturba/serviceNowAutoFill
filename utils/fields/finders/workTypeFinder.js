/**
 * Find work_type field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_type field or null
 */
window.FieldFinder.findWorkTypeField = window.FieldFinder.createFieldFinder('work_type', [
  'select[id$=".u_work_type"]',
  'select[id$="u_work_type"]',
  'select[name$=".u_work_type"]',
  'select[id*="work_type"]',
  'input[id$=".u_work_type"]',
  'input[id$="u_work_type"]',
  'input[id*="work_type"]'
]);

