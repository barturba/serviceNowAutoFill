/**
 * Find category field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The category field or null
 */
window.FieldFinder.findCategoryField = window.FieldFinder.createFieldFinder('category', [
  'select[id$=".category"]',
  'select[id$="category"]',
  'select[name$=".category"]',
  'select[id*="category"]',
  'input[id$=".category"]',
  'input[id*="category"]'
]);

