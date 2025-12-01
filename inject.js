/**
 * Injected script that runs in page context
 * This script uses the injected utility modules to fill ServiceNow forms
 * 
 * Note: This file expects the utility modules to be injected first via popup.js
 */

/**
 * Main function injected into page context to fill time entry form
 * @param {string} timeValue - Time duration string (e.g., "15 minutes")
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function fillTimeInNestedFrame(timeValue) {
  console.log('Starting fillTimeInNestedFrame...');
  console.log('Current URL:', window.location.href);

  // Check that required functions are available (from injected modules)
  if (!window.FormFiller || !window.FormFiller.processIncidentForm) {
    throw new Error('FormFiller.processIncidentForm not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.findIframeInDOM) {
    throw new Error('IframeFinder.findIframeInDOM not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.waitForIframeLoad) {
    throw new Error('IframeFinder.waitForIframeLoad not found. Make sure utils modules are injected.');
  }

  // First, check if we're already in the incident form (no iframe needed)
  const directTimeField = document.querySelector('[id*="time_worked"]');
  const directWorkStart = document.querySelector('[id*="work_start"]');
  if (directTimeField || directWorkStart) {
    console.log('✓ Found incident form fields directly in current document (no iframe needed)');
    return await window.FormFiller.processIncidentForm(document, timeValue);
  }

  console.log('Fields not in current document, searching for iframe...');

  try {
    const iframe = await window.IframeFinder.findIframeInDOM();
    console.log('✓ Found iframe:', iframe);

    const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
    return await window.FormFiller.processIncidentForm(iframeDoc, timeValue);
  } catch (error) {
    console.error('Error finding or accessing iframe:', error);
    return { success: false, error: error.message };
  }
}

// Make function available globally for chrome.scripting.executeScript
window.fillTimeInNestedFrame = fillTimeInNestedFrame;

