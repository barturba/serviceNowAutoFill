/**
 * Timing constants for delays and timeouts
 */

// Delay constants (in milliseconds)
const DELAY_BUTTON_CLICK = 200;
const DELAY_SAVE_VERIFY = 300;
const DELAY_FIELD_FOCUS = 100;
const DELAY_TAB_SWITCH_INITIAL = 100;
const DELAY_TAB_SWITCH_FINAL = 400;
const DELAY_IFRAME_POLL = 500;
const DELAY_ALERT_CLEARED = 100;
const DELAY_ASSIGNMENT_GROUP_PROCESS = 800;

// Make available globally for injected scripts
window.TimingConstants = window.TimingConstants || {
  DELAY_BUTTON_CLICK,
  DELAY_SAVE_VERIFY,
  DELAY_FIELD_FOCUS,
  DELAY_TAB_SWITCH_INITIAL,
  DELAY_TAB_SWITCH_FINAL,
  DELAY_IFRAME_POLL,
  DELAY_ALERT_CLEARED,
  DELAY_ASSIGNMENT_GROUP_PROCESS
};

/**
 * Delay utility function for cleaner Promise-based delays
 * Replaces sequential setTimeout calls with a more readable API
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after the delay
 */
window.delay = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

