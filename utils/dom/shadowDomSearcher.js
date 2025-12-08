/**
 * Shadow DOM search utilities
 */

window.IframeFinder = window.IframeFinder || {};

window.IframeFinder.findInShadowRoots = function(root, iframeSelectors, depth = 0) {
  for (const selector of iframeSelectors) {
    try {
      for (const iframe of root.querySelectorAll(selector)) {
        if (window.IframeFinder.isIncidentFrame(iframe) || 
            iframe.id === 'gsft_main' || iframe.name === 'gsft_main') {
          return iframe;
        }
      }
    } catch (e) {
      console.debug('Error querying selector in shadow DOM:', selector, e.message);
    }
  }

  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) {
      const found = window.IframeFinder.findInShadowRoots(element.shadowRoot, iframeSelectors, depth + 1);
      if (found) return found;
    }
  }
  return null;
};

