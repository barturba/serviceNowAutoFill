/**
 * Validation utilities for injected functions
 */

function validateFormFiller(functionName) {
  if (!window.FormFiller || !window.FormFiller[functionName]) {
    throw new Error(`FormFiller.${functionName} not found. Make sure utils modules are injected.`);
  }
}

function validateIframeFinder() {
  if (!window.IframeFinder?.findIframeInDOM || !window.IframeFinder?.waitForIframeLoad) {
    throw new Error('IframeFinder functions not found. Make sure utils modules are injected.');
  }
}

function validateFormProcessing() {
  validateFormFiller('processIncidentForm');
  validateIframeFinder();
}

function validateAlertCleared() {
  validateFormFiller('processAlertCleared');
  validateIframeFinder();
}

function validateMacdAssignment() {
  validateFormFiller('processMacdAssignment');
  validateIframeFinder();
}

function isDirectDocument() {
  return !!(document.querySelector('[id*="time_worked"]') || document.querySelector('[id*="work_start"]'));
}

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

