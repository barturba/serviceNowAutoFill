/**
 * Field finder factory
 */

/**
 * Generic field finder factory
 * @param {string} fieldName - Name of the field
 * @param {string[]} selectors - Array of CSS selectors to try
 * @returns {Function} Async function that finds the field
 */
function createFieldFinder(fieldName, selectors) {
  return async function(doc) {
    let field = window.FieldFinder.querySelectorFirst(doc, selectors);
    if (!field) {
      window.DebugLogger.log(`Waiting for ${fieldName} field...`);
      try {
        field = await window.FieldFinder.waitForElement(doc, selectors.join(', '));
      } catch (e) {
        window.DebugLogger.log(`Could not find ${fieldName} field:`, e.message);
        return null;
      }
    }
    window.DebugLogger.log(`Found ${fieldName}:`, field?.id);
    return field;
  };
}

window.FieldFinder = window.FieldFinder || {};
window.FieldFinder.createFieldFinder = createFieldFinder;

