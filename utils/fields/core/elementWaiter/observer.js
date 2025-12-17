/**
 * Observer setup for element waiting
 */

function setupObserver(doc, selector, resolve, reject, timeout) {
  let observer = null;
  let timeoutId = null;
  const isResolved = { value: false };
  
  const cleanup = window.ElementWaiter.createCleanup(observer, timeoutId);
  const handlers = window.ElementWaiter.createResolveReject(
    isResolved, cleanup, resolve, reject
  );
  
  try {
    observer = new MutationObserver(() => {
      const el = doc.querySelector(selector);
      if (el) handlers.resolve(el);
    });
    observer.observe(doc.body || doc.documentElement, { 
      childList: true, 
      subtree: true 
    });
    timeoutId = setTimeout(
      () => handlers.reject(new Error(`Timeout waiting for ${selector}`)), 
      timeout
    );
  } catch (error) {
    cleanup();
    handlers.reject(error);
  }
}

window.ElementWaiter = window.ElementWaiter || {};
window.ElementWaiter.setupObserver = setupObserver;

