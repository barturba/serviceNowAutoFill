/**
 * Field clearing utilities
 */

/**
 * Clear field value and dispatch events
 * @param {HTMLElement} field - Field element
 * @returns {Promise<void>}
 */
async function clearFieldValue(field) {
  if (!field) return;
  field.value = '';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  await window.delay(100);
}

window.clearFieldValue = clearFieldValue;
