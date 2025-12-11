/**
 * Shadow DOM search utilities
 */

window.IframeFinder = window.IframeFinder || {};

// Maximum depth for shadow DOM traversal to prevent infinite recursion and performance issues
const MAX_SHADOW_DEPTH = 10;

/**
 * Find iframe in shadow DOM with optimized traversal
 * Optimizations:
 * - Depth limiting to prevent infinite recursion
 * - Early exit when iframe is found
 * - Try iframe selectors before scanning for shadow roots
 * @param {Document|ShadowRoot|Element} root - Root element to search in
 * @param {string[]} iframeSelectors - Array of CSS selectors for iframes
 * @param {number} depth - Current traversal depth (default: 0)
 * @returns {HTMLIFrameElement|null} Found iframe or null
 */
window.IframeFinder.findInShadowRoots = function(root, iframeSelectors, depth = 0) {
  // Limit traversal depth to prevent infinite recursion and performance issues
  if (depth > MAX_SHADOW_DEPTH) {
    console.debug('Max shadow DOM depth reached, stopping traversal');
    return null;
  }

  // First, try to find iframes directly using specific selectors (most efficient)
  // This avoids scanning for shadow roots if iframe is found immediately
  for (const selector of iframeSelectors) {
    try {
      const iframes = root.querySelectorAll(selector);
      for (const iframe of iframes) {
        if (window.IframeFinder.isIncidentFrame(iframe) || 
            iframe.id === 'gsft_main' || iframe.name === 'gsft_main') {
          return iframe;
        }
      }
    } catch (e) {
      console.debug('Error querying selector in shadow DOM:', selector, e.message);
    }
  }

  // Only if no iframe found, search for shadow roots
  // This is expensive but necessary to find iframes nested in shadow DOM
  try {
    // Scan elements for shadow roots - this is still needed but we've already
    // tried the most efficient path (direct iframe selectors) above
    const allElements = root.querySelectorAll('*');
    for (const element of allElements) {
      // Early exit: if we found an iframe in a shadow root, return immediately
      if (element.shadowRoot) {
        const found = window.IframeFinder.findInShadowRoots(element.shadowRoot, iframeSelectors, depth + 1);
        if (found) return found;
      }
    }
  } catch (e) {
    console.debug('Error traversing shadow DOM:', e.message);
  }

  return null;
};

