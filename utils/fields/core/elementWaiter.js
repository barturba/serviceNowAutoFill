/**
 * Element waiting utilities
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
    
    const cleanup = () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      observer = timeoutId = null;
    };
    
    const resolve = (value) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolveWait(value);
      }
    };
    const reject = (error) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        rejectWait(error);
      }
    };
    
    try {
      observer = new MutationObserver(() => {
        const el = doc.querySelector(selector);
        if (el) resolve(el);
      });
      observer.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
      timeoutId = setTimeout(() => reject(new Error(`Timeout waiting for ${selector}`)), timeout);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
};
