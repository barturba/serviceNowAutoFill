/**
 * Async operations for iframe finding
 */

async function findIframeInDOM(timeout = 15000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const iframe = window.IframeFinder.findInShadowRoots(
      document, 
      window.IframeFinder.IFRAME_SELECTORS
    );
    if (iframe) return iframe;
    await window.delay(window.TimingConstants.DELAY_IFRAME_POLL);
  }
  throw new Error('Timeout: iframe not found after searching both regular and shadow DOM');
}

async function waitForIframeLoad(iframe) {
  return new Promise((resolve, reject) => {
    function checkReady() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc || doc.readyState !== 'complete') {
          return setTimeout(checkReady, 500);
        }
        resolve(doc);
      } catch (error) {
        reject(new Error('Cannot access iframe: ' + error.message));
      }
    }
    checkReady();
    iframe.addEventListener('load', checkReady);
    setTimeout(checkReady, 1000);
  });
}

window.IframeFinder = window.IframeFinder || {};
window.IframeFinder.findIframeInDOM = findIframeInDOM;
window.IframeFinder.waitForIframeLoad = waitForIframeLoad;

