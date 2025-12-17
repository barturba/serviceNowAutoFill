/**
 * Find work_end field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The work_end field or null
 */
window.FieldFinder.findWorkEndField = window.FieldFinder.createFieldFinder('work_end', [
  'input[id$=".u_work_end"]:not([type="hidden"])',
  'input[id$="u_work_end"]:not([type="hidden"])',
  'input[name$=".u_work_end"]:not([type="hidden"])',
  'input[id*="work_end"]:not([type="hidden"])'
]);

