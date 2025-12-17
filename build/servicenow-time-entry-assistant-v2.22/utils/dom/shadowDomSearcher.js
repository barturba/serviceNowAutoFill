/**
 * Shadow DOM search utilities
 */

window.IframeFinder = window.IframeFinder || {};

/**
 * Find iframe in shadow DOM with optimized traversal
 * @param {Document|ShadowRoot|Element} root - Root element to search in
 * @param {string[]} iframeSelectors - Array of CSS selectors for iframes
 * @param {number} depth - Current traversal depth (default: 0)
 * @returns {HTMLIFrameElement|null} Found iframe or null
 */
window.IframeFinder.findInShadowRoots = function(root, iframeSelectors, depth = 0) {
  const found = trySelectors(root, iframeSelectors);
  if (found) return found;
  return searchShadowRoots(root, iframeSelectors, depth);
};

