/**
 * Field finding utilities for ServiceNow forms
 */

// Use global namespace for injected scripts
window.FieldFinder = window.FieldFinder || {};

/**
 * Try multiple selectors sequentially and return the first match
 * This is more efficient than chaining querySelector calls with || because
 * it stops scanning once a match is found, reducing DOM traversal
 * @param {Document} doc - Document to search in
 * @param {string[]} selectors - Array of CSS selectors to try (in priority order)
 * @returns {Element|null} The first matching element or null if none found
 */
window.FieldFinder.querySelectorFirst = function(doc, selectors) {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
};

/**
 * Generic field finder factory
 * Creates a field finder function for a specific field name
 * @param {string} fieldName - Name of the field (e.g., 'assignment_group', 'category')
 * @param {string[]} selectors - Array of CSS selectors to try
 * @returns {Function} Async function that finds the field in a document
 */
window.FieldFinder.createFieldFinder = function(fieldName, selectors) {
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
    window.DebugLogger.log(`Found ${fieldName}:`, field?.id, 'tag:', field?.tagName, 'type:', field?.type);
    return field;
  };
};


