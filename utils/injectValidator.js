/**
 * Validation utilities for injected functions
 */

/**
 * Validate that required FormFiller functions are available
 */
function validateFormFiller(functionName) {
  if (!window.FormFiller || !window.FormFiller[functionName]) {
    throw new Error(`FormFiller.${functionName} not found. Make sure utils modules are injected.`);
  }
}

/**
 * Validate that required IframeFinder functions are available
 */
function validateIframeFinder() {
  if (!window.IframeFinder || !window.IframeFinder.findIframeInDOM) {
    throw new Error('IframeFinder.findIframeInDOM not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.waitForIframeLoad) {
    throw new Error('IframeFinder.waitForIframeLoad not found. Make sure utils modules are injected.');
  }
}

/**
 * Validate all required dependencies for form processing
 */
function validateFormProcessing() {
  validateFormFiller('processIncidentForm');
  validateIframeFinder();
}

/**
 * Validate all required dependencies for alert cleared processing
 */
function validateAlertCleared() {
  validateFormFiller('processAlertCleared');
  validateIframeFinder();
}

/**
 * Check if form fields are directly in current document
 */
function isDirectDocument() {
  const directTimeField = document.querySelector('[id*="time_worked"]');
  const directWorkStart = document.querySelector('[id*="work_start"]');
  return !!(directTimeField || directWorkStart);
}

/**
 * Resolve document (direct or via iframe)
 */
async function resolveDocument() {
  if (isDirectDocument()) {
    console.log('✓ Found incident form fields directly in current document (no iframe needed)');
    return document;
  }

  console.log('Fields not in current document, searching for iframe...');
  const iframe = await window.IframeFinder.findIframeInDOM();
  console.log('✓ Found iframe:', iframe);
  return await window.IframeFinder.waitForIframeLoad(iframe);
}

// Make functions available globally
window.validateFormProcessing = validateFormProcessing;
window.validateAlertCleared = validateAlertCleared;
window.resolveDocument = resolveDocument;

