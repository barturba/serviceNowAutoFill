/**
 * State field setter for MACD assignment
 */

/**
 * Set State field to Assigned
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - State field element
 * @returns {boolean} True if field was set successfully
 */
function setStateField(doc, field) {
  if (!field) return false;
  window.setSelectFieldValue(doc, field, 'state', 
    o => o.text === 'Assigned' || o.value === '2', 
    '2');
  window.dispatchFieldEvents(field, ['input', 'change']);
  return true;
}

