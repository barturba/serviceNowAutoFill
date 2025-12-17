/**
 * Element waiting utilities
 */

window.FieldFinder.waitForElement = async function(doc, selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = doc.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    window.ElementWaiter.setupObserver(doc, selector, resolve, reject, timeout);
  });
};

