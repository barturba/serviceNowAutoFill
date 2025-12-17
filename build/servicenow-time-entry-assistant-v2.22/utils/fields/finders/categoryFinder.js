/**
 * Find category field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The category field or null
 */
window.FieldFinder.findCategoryField = async function(doc) {
  let categoryField = window.FieldFinder.querySelectorFirst(doc, [
    'select[id$=".category"]',
    'select[id$="category"]',
    'select[name$=".category"]',
    'select[id*="category"]',
    'input[id$=".category"]',
    'input[id*="category"]'
  ]);
  if (!categoryField) {
    console.log('Waiting for category field...');
    try {
      categoryField = await window.FieldFinder.waitForElement(doc, 'select[id$=".category"], select[id$="category"], select[id*="category"], input[id*="category"]');
    } catch (e) {
      console.log('Could not find category field:', e.message);
    }
  }
  console.log('Found category:', categoryField?.id, 'tag:', categoryField?.tagName, 'type:', categoryField?.type);
  return categoryField;
};

