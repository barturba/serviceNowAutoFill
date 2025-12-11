/**
 * Resolution tab search utilities
 */

function isResolutionTab(elem) {
  const text = (elem.textContent || elem.innerText || '').trim().toLowerCase();
  const ariaLabel = (elem.getAttribute('aria-label') || '').toLowerCase();
  const className = (elem.className || '').toLowerCase();
  return (text.includes('resolution') || ariaLabel.includes('resolution')) &&
         !className.includes('info') && !className.includes('icon') &&
         text.length > 2;
}

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

function searchInAllTabs(doc) {
  for (const link of doc.querySelectorAll('a[role="tab"], button[role="tab"], a.nav-link, button.nav-link')) {
    if (isResolutionTab(link)) return link;
  }
  return null;
}
