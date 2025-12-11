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


