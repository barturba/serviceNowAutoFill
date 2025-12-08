/**
 * Iframe validation utilities
 */

window.IframeFinder = window.IframeFinder || {};

/**
 * Check if an iframe contains an incident form
 * @param {HTMLIFrameElement} iframe - The iframe element to check
 * @returns {boolean} True if iframe contains incident form
 */
window.IframeFinder.isIncidentFrame = function(iframe) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return false;
    const hasTimeWorked = !!doc.querySelector('[id*="time_worked"]');
    const hasIncidentForm = !!doc.querySelector('form[action*="incident"]') ||
                           doc.location.href.includes('incident');
    const hasWorkStart = !!doc.querySelector('[id*="work_start"]');
    return hasTimeWorked || hasIncidentForm || hasWorkStart;
  } catch (e) {
    // Cross-origin or access denied - can't check content
    return false;
  }
};

