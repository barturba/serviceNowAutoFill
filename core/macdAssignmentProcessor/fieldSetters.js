/**
 * Field-specific setters for MACD assignment
 */

/**
 * Set Category field to Collaboration
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Category field element
 * @returns {boolean} True if field was set successfully
 */
function setCategoryField(doc, field) {
  if (!field) return false;
  window.setSelectFieldValue(doc, field, 'category', 
    o => o.text === 'Collaboration' || o.value === 'Collaboration', 
    'Collaboration');
  window.dispatchFieldEvents(field, ['input', 'change']);
  return true;
}

/**
 * Set Subcategory field to MACD
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Subcategory field element
 * @returns {boolean} True if field was set successfully
 */
function setSubcategoryField(doc, field) {
  if (!field) return false;
  window.setSelectFieldValue(doc, field, 'subcategory', 
    o => o.text === 'MACD' || o.value === 'MACD', 
    'MACD');
  window.dispatchFieldEvents(field, ['input', 'change']);
  return true;
}

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

// Make functions available globally for steps.js
window.setCategoryField = setCategoryField;
window.setSubcategoryField = setSubcategoryField;
window.setAssignmentGroupField = setAssignmentGroupField;
window.setAssignedToField = setAssignedToField;

