/**
 * Validation utilities for injected functions
 */

/**
 * Validate FormFiller function exists
 * @param {string} functionName - Name of function to validate
 * @throws {Error} If function not found
 */
function validateFormFiller(functionName) {
  if (!window.FormFiller || !window.FormFiller[functionName]) {
    throw new Error(`FormFiller.${functionName} not found. Make sure utils modules are injected.`);
  }
}

/**
 * Validate IframeFinder functions exist
 * @throws {Error} If functions not found
 */
function validateIframeFinder() {
  if (!window.IframeFinder?.findIframeInDOM || !window.IframeFinder?.waitForIframeLoad) {
    throw new Error('IframeFinder functions not found. Make sure utils modules are injected.');
  }
}

/**
 * Validate form processing dependencies
 */
function validateFormProcessing() {
  validateFormFiller('processIncidentForm');
  validateIframeFinder();
}

/**
 * Validate alert cleared dependencies
 */
function validateAlertCleared() {
  validateFormFiller('processAlertCleared');
  validateIframeFinder();
}

/**
 * Validate MACD assignment dependencies
 */
function validateMacdAssignment() {
  validateFormFiller('processMacdAssignment');
  validateIframeFinder();
}

/**
 * Check if form fields are directly in document (no iframe)
 * @returns {boolean} True if fields found directly
 */
function isDirectDocument() {
  return !!(document.querySelector('[id*="time_worked"]') || document.querySelector('[id*="work_start"]'));
}

/**
 * Resolve document (direct or from iframe)
 * @returns {Promise<Document>} Document containing the form
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
window.validateMacdAssignment = validateMacdAssignment;
window.resolveDocument = resolveDocument;
