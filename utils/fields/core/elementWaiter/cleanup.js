/**
 * Cleanup utilities for element waiting
 */

function createCleanup(observer, timeoutId) {
  return () => {
    if (observer) observer.disconnect();
    if (timeoutId) clearTimeout(timeoutId);
  };
}

function createResolveReject(isResolved, cleanup, resolveWait, rejectWait) {
  const resolve = (value) => {
    if (!isResolved.value) {
      isResolved.value = true;
      cleanup();
      resolveWait(value);
    }
  };
  
  const reject = (error) => {
    if (!isResolved.value) {
      isResolved.value = true;
      cleanup();
      rejectWait(error);
    }
  };
  
  return { resolve, reject };
}

window.ElementWaiter = window.ElementWaiter || {};
window.ElementWaiter.createCleanup = createCleanup;
window.ElementWaiter.createResolveReject = createResolveReject;

