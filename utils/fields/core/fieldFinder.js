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
    
    let observer = null;
    let timeoutId = null;
    let isResolved = false;
    
    // Cleanup function to ensure observer and timeout are always cleared
    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    // Resolve function that ensures cleanup
    const resolve = (value) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolveWait(value);
      }
    };
    
    // Reject function that ensures cleanup
    const reject = (error) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        rejectWait(error);
      }
    };
    
    try {
      observer = new MutationObserver(() => {
        const element = doc.querySelector(selector);
        if (element) {
          resolve(element);
        }
      });
      
      observer.observe(doc.body || doc.documentElement, {
        childList: true,
        subtree: true
      });
      
      timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    } catch (error) {
      // If observer creation fails, cleanup and reject
      cleanup();
      reject(error);
    }
  });
};

