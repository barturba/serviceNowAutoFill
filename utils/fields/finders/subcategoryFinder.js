/**
 * Find subcategory field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The subcategory field or null
 */
window.FieldFinder.findSubcategoryField = async function(doc) {
  let subcategoryField = window.FieldFinder.querySelectorFirst(doc, [
    'select[id$=".subcategory"]',
    'select[id$="subcategory"]',
    'select[name$=".subcategory"]',
    'select[id*="subcategory"]',
    'input[id$=".subcategory"]',
    'input[id*="subcategory"]'
  ]);
  if (!subcategoryField) {
    console.log('Waiting for subcategory field...');
    try {
      subcategoryField = await window.FieldFinder.waitForElement(doc, 'select[id$=".subcategory"], select[id$="subcategory"], select[id*="subcategory"], input[id*="subcategory"]');
    } catch (e) {
      console.log('Could not find subcategory field:', e.message);
    }
  }
  console.log('Found subcategory:', subcategoryField?.id, 'tag:', subcategoryField?.tagName, 'type:', subcategoryField?.type);
  return subcategoryField;
};

