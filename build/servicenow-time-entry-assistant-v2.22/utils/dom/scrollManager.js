/**
 * Scroll position management utilities
 */

/**
 * Save current scroll positions
 * @returns {Object} Scroll positions object
 */
function saveScrollPositions(doc) {
  return {
    window: { x: window.scrollX || window.pageXOffset, y: window.scrollY || window.pageYOffset },
    document: { x: doc.documentElement.scrollLeft, y: doc.documentElement.scrollTop },
    body: { x: doc.body.scrollLeft, y: doc.body.scrollTop }
  };
}

/**
 * Restore scroll positions
 * @param {Document} doc - Document to restore scroll for
 * @param {Object} scrollPositions - Saved scroll positions
 */
function restoreScrollPositions(doc, scrollPositions) {
  try {
    window.scrollTo(scrollPositions.window.x, scrollPositions.window.y);
    doc.documentElement.scrollLeft = scrollPositions.document.x;
    doc.documentElement.scrollTop = scrollPositions.document.y;
    doc.body.scrollLeft = scrollPositions.body.x;
    doc.body.scrollTop = scrollPositions.body.y;
  } catch (e) {
    console.log('Could not restore scroll position:', e.message);
  }
}

// Make available globally
window.saveScrollPositions = saveScrollPositions;
window.restoreScrollPositions = restoreScrollPositions;

