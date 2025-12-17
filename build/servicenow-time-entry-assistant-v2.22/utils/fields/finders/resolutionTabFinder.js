/**
 * Resolution tab finding utilities
 */

/**
 * Find resolution tab in document
 * @param {Document} doc - Document to search
 * @returns {HTMLElement|null} Resolution tab element or null
 */
function findResolutionTab(doc) {
  return searchWithSelectors(doc) || searchInAllTabs(doc);
}

// Make available globally
window.findResolutionTab = findResolutionTab;
window.clickResolutionTab = clickResolutionTab;
