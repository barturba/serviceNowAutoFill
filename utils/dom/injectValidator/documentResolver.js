/**
 * Document resolution utilities
 */

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

