/**
 * Find state field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The state field or null
 */
window.FieldFinder.findStateField = window.FieldFinder.createFieldFinder('state', [
  'select[id$=".state"]',
  'select[id$="state"]',
  'select[name$=".state"]',
  'select[id*="state"]',
  'input[id$=".state"]',
  'input[id*="state"]'
]);

