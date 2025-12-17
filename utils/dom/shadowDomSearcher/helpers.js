/**
 * Shadow DOM search helper functions
 */

const MAX_SHADOW_DEPTH = 10;

function matchesIncidentFrame(iframe) {
  return window.IframeFinder.isIncidentFrame(iframe) || 
         iframe.id === 'gsft_main' || iframe.name === 'gsft_main';
}

function trySelectors(root, iframeSelectors) {
  for (const selector of iframeSelectors) {
    try {
      for (const iframe of root.querySelectorAll(selector)) {
        if (matchesIncidentFrame(iframe)) return iframe;
      }
    } catch (e) {
      console.debug('Error querying selector in shadow DOM:', selector, e.message);
    }
  }
  return null;
}

function searchShadowRoots(root, iframeSelectors, depth) {
  if (depth > MAX_SHADOW_DEPTH) {
    console.debug('Max shadow DOM depth reached, stopping traversal');
    return null;
  }

  try {
    for (const element of root.querySelectorAll('*')) {
      if (element.shadowRoot) {
        const found = window.IframeFinder.findInShadowRoots(element.shadowRoot, iframeSelectors, depth + 1);
        if (found) return found;
      }
    }
  } catch (e) {
    console.debug('Error traversing shadow DOM:', e.message);
  }

  return null;
}

