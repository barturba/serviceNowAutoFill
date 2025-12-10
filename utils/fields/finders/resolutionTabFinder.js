/**
 * Resolution tab finding utilities
 */

/**
 * Check if element is a resolution tab
 * @param {HTMLElement} elem - Element to check
 * @returns {boolean} True if element is a resolution tab
 */
function isResolutionTab(elem) {
  const text = (elem.textContent || elem.innerText || '').trim().toLowerCase();
  const ariaLabel = (elem.getAttribute('aria-label') || '').toLowerCase();
  const className = (elem.className || '').toLowerCase();
  return (text.includes('resolution') || ariaLabel.includes('resolution')) &&
         !className.includes('info') && !className.includes('icon') &&
         text.length > 2;
}

/**
 * Search for resolution tab using specific selectors
 * @param {Document} doc - Document to search
 * @returns {HTMLElement|null} Resolution tab element or null
 */
function searchWithSelectors(doc) {
  const selectors = [
    'a[aria-label*="Resolution"][role="tab"]',
    'a[aria-label*="Resolution"]:not([class*="info"]):not([class*="icon"])',
    'button[aria-label*="Resolution"][role="tab"]',
    'a[href*="#resolution"]:not([class*="info"]):not([class*="icon"])',
    'a[href*="#tab_resolution"]'
  ];

  for (const selector of selectors) {
    try {
      for (const elem of doc.querySelectorAll(selector)) {
        if (isResolutionTab(elem)) return elem;
      }
    } catch (e) {
      console.debug('Error querying resolution tab selector:', selector, e.message);
    }
  }
  return null;
}

/**
 * Search for resolution tab in all tab elements
 * @param {Document} doc - Document to search
 * @returns {HTMLElement|null} Resolution tab element or null
 */
function searchInAllTabs(doc) {
  for (const link of doc.querySelectorAll('a[role="tab"], button[role="tab"], a.nav-link, button.nav-link')) {
    if (isResolutionTab(link)) return link;
  }
  return null;
}

/**
 * Find resolution tab in document
 * @param {Document} doc - Document to search
 * @returns {HTMLElement|null} Resolution tab element or null
 */
function findResolutionTab(doc) {
  return searchWithSelectors(doc) || searchInAllTabs(doc);
}

/**
 * Click resolution tab and wait for it to load
 * @param {HTMLElement} resolutionTab - Resolution tab element
 * @param {Document} doc - Document containing the tab
 * @param {Function} restoreScroll - Function to restore scroll position
 * @returns {Promise<void>}
 */
async function clickResolutionTab(resolutionTab, doc, restoreScroll) {
  resolutionTab.click();
  restoreScroll();
  await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_TAB_SWITCH_INITIAL));
  restoreScroll();
  await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_TAB_SWITCH_FINAL));
  restoreScroll();
}

// Make available globally
window.findResolutionTab = findResolutionTab;
window.clickResolutionTab = clickResolutionTab;
