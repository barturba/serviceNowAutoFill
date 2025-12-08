/**
 * Field finding utilities for ServiceNow forms
 */

// Use global namespace for injected scripts
window.FieldFinder = window.FieldFinder || {};

/**
 * Wait for an element to appear in the document
 * @param {Document} doc - Document to search in
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Element>} The found element
 */
window.FieldFinder.waitForElement = async function(doc, selector, timeout = 10000) {
  return new Promise((resolveWait, rejectWait) => {
    const element = doc.querySelector(selector);
    if (element) {
      resolveWait(element);
      return;
    }
    const observer = new MutationObserver(() => {
      const element = doc.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolveWait(element);
      }
    });
    observer.observe(doc.body || doc.documentElement, {
      childList: true,
      subtree: true
    });
    setTimeout(() => {
      observer.disconnect();
      rejectWait(new Error(`Timeout waiting for ${selector}`));
    }, timeout);
  });
};

