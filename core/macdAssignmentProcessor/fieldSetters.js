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
 * Set Subcategory field to MACD with retry logic for dynamically loaded options
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Subcategory field element
 * @returns {Promise<boolean>} True if field was set successfully
 */
async function setSubcategoryField(doc, field) {
  if (!field) return false;
  
  const maxAttempts = window.TimingConstants?.SUBCATEGORY_RETRY_ATTEMPTS || 5;
  const retryInterval = window.TimingConstants?.SUBCATEGORY_RETRY_INTERVAL || 200;
  const optionMatcher = o => o.text === 'MACD' || o.value === 'MACD';
  const targetValue = 'MACD';
  
  // Try to find and set the MACD option, with retries
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check if MACD option is available
    if (field.tagName === 'SELECT') {
      const matchedOption = Array.from(field.options).find(optionMatcher);
      if (matchedOption) {
        // Option found, set it
        window.setSelectFieldValue(doc, field, 'subcategory', optionMatcher, targetValue);
        window.dispatchFieldEvents(field, ['input', 'change']);
        console.log(`✓ Subcategory MACD option found and set (attempt ${attempt})`);
        return true;
      }
    } else {
      // Not a SELECT element, try direct value setting
      window.setSelectFieldValue(doc, field, 'subcategory', optionMatcher, targetValue);
      window.dispatchFieldEvents(field, ['input', 'change']);
      return true;
    }
    
    // Option not found yet, wait and retry
    if (attempt < maxAttempts) {
      console.log(`Subcategory MACD option not yet available, retrying (attempt ${attempt}/${maxAttempts})...`);
      await window.delay(retryInterval);
    }
  }
  
  // All retries exhausted, MACD option not found
  console.log(`✗ Subcategory MACD option not found after ${maxAttempts} attempts`);
  return false;
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

