/**
 * Find resolution_code field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The resolution_code field or null
 */
window.FieldFinder.findResolutionCodeField = async function(doc) {
  let resolutionCodeField = window.FieldFinder.querySelectorFirst(doc, [
    'select[id$=".close_code"]',
    'select[id$="close_code"]',
    'select[name$=".close_code"]',
    'select[id*="close_code"]',
    'select[id$=".resolution_code"]',
    'select[id$="resolution_code"]',
    'input[id*="close_code"]',
    'input[id*="resolution_code"]'
  ]);
  if (!resolutionCodeField) {
    console.log('Waiting for resolution_code field...');
    try {
      resolutionCodeField = await window.FieldFinder.waitForElement(doc, 'select[id$=".close_code"], select[id$="close_code"], select[id*="close_code"], select[id*="resolution_code"]');
    } catch (e) {
      console.log('Could not find resolution_code field:', e.message);
    }
  }
  console.log('Found resolution_code:', resolutionCodeField?.id, 'tag:', resolutionCodeField?.tagName, 'type:', resolutionCodeField?.type);
  return resolutionCodeField;
};

