/**
 * Find subcategory field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The subcategory field or null
 */
window.FieldFinder.findSubcategoryField = window.FieldFinder.createFieldFinder('subcategory', [
  'select[id$=".subcategory"]',
  'select[id$="subcategory"]',
  'select[name$=".subcategory"]',
  'select[id*="subcategory"]',
  'input[id$=".subcategory"]',
  'input[id*="subcategory"]'
]);

