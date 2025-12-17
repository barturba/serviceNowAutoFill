/**
 * Validation functions for injected scripts
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

