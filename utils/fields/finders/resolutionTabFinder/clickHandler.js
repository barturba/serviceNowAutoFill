/**
 * Resolution tab click handler
 */

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
  await window.delay(window.TimingConstants.DELAY_TAB_SWITCH_INITIAL);
  restoreScroll();
  await window.delay(window.TimingConstants.DELAY_TAB_SWITCH_FINAL);
  restoreScroll();
}



