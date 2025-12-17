/**
 * Selector utilities for field finding
 */

/**
 * Try multiple selectors sequentially and return the first match
 * @param {Document} doc - Document to search in
 * @param {string[]} selectors - Array of CSS selectors to try
 * @returns {Element|null} The first matching element or null
 */
function querySelectorFirst(doc, selectors) {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      return element;
    }
  }
  return null;
}

window.FieldFinder = window.FieldFinder || {};
window.FieldFinder.querySelectorFirst = querySelectorFirst;

