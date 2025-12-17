/**
 * Find resolution_code field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The resolution_code field or null
 */
window.FieldFinder.findResolutionCodeField = window.FieldFinder.createFieldFinder('resolution_code', [
  'select[id$=".close_code"]',
  'select[id$="close_code"]',
  'select[name$=".close_code"]',
  'select[id*="close_code"]',
  'select[id$=".resolution_code"]',
  'select[id$="resolution_code"]',
  'input[id*="close_code"]',
  'input[id*="resolution_code"]'
]);

