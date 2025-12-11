/**
 * Assignment group and assigned to field setters
 */

/**
 * Set Assignment Group field to MS MACD
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Assignment Group field element
 * @returns {boolean} True if field was set successfully
 */
function setAssignmentGroupField(doc, field) {
  if (!field) return false;
  window.setSelectFieldValue(doc, field, 'assignment_group', 
    o => o.text === 'MS MACD' || o.value === 'MS MACD', 
    'MS MACD');
  window.dispatchFieldEvents(field, ['input', 'change']);
  return true;
}

/**
 * Set Assigned To field to agent name
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Assigned To field element
 * @param {string} agentName - Agent name to assign
 * @returns {Promise<boolean>} True if field was set successfully
 */
async function setAssignedToField(doc, field, agentName) {
  if (!field || !agentName) return false;
  await window.setReferenceFieldValue(doc, field, 'assigned_to', agentName);
  return true;
}
