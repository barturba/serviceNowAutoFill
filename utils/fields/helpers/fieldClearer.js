/**
 * Field clearing utilities
 */

/**
 * Clear field value and dispatch events
 * @param {HTMLElement} field - Field element
 * @returns {Promise<void>}
 */
async function clearFieldValue(field) {
  field.value = '';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  await window.delay(100);
}
