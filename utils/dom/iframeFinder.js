/**
 * Iframe finding utilities for ServiceNow pages
 */

window.IframeFinder = window.IframeFinder || {};

const IFRAME_SELECTORS = [
  'iframe#gsft_main', 'iframe[name="gsft_main"]', 'iframe[id*="gsft"]',
  'iframe[name*="gsft"]', 'iframe[title*="Main"]', 'iframe[title*="Content"]',
  'iframe[src*="incident"]', 'iframe[src*="sys_id"]', 'iframe'
];

window.IframeFinder.findIframeInDOM = async function(timeout = 15000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const iframe = window.IframeFinder.findInShadowRoots(document, IFRAME_SELECTORS);
    if (iframe) return iframe;
    await window.delay(window.TimingConstants.DELAY_IFRAME_POLL);
  }
  throw new Error('Timeout: iframe not found after searching both regular and shadow DOM');
};

window.IframeFinder.waitForIframeLoad = async function(iframe) {
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
};

