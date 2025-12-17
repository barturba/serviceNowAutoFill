/**
 * Find work_start field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_start field or null
 */
window.FieldFinder.findWorkStartField = window.FieldFinder.createFieldFinder('work_start', [
  'input[id$=".u_work_start"]:not([type="hidden"])',
  'input[id$="u_work_start"]:not([type="hidden"])',
  'input[name$=".u_work_start"]:not([type="hidden"])',
  'input[id*="work_start"]:not([type="hidden"])'
]);

