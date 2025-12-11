/**
 * Field setting utilities for alert cleared workflow
 */

/**
 * Get g_form API from document
 * @param {Document} doc - Document containing the form
 * @returns {Object|null} g_form API object or null
 */
function getGForm(doc) {
  return doc.defaultView?.g_form || null;
}

/**
 * Set field value using g_form API or direct manipulation
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Field element
 * @param {string} fieldName - Field name for g_form API
 * @param {string} value - Value to set
 */
function setFieldValue(doc, field, fieldName, value) {
  const gForm = getGForm(doc);
  if (gForm) {
    try {
      gForm.setValue(fieldName, value);
    } catch (e) {
      field.value = value;
    }
  } else {
    field.value = value;
  }
}

/**
 * Set select field value by matching option
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Select field element
 * @param {string} fieldName - Field name for g_form API
 * @param {Function} optionMatcher - Function to match option
 * @param {string} fallbackValue - Fallback value if no match
 */
function setSelectFieldValue(doc, field, fieldName, optionMatcher, fallbackValue) {
  if (field.tagName === 'SELECT') {
    const matchedOption = Array.from(field.options).find(optionMatcher);
    setFieldValue(doc, field, fieldName, matchedOption ? matchedOption.value : fallbackValue);
  } else {
    field.value = fallbackValue;
  }
}

/**
 * Dispatch events on a field element
 * @param {HTMLElement} field - Field element
 * @param {string[]} eventTypes - Array of event types to dispatch
 */
function dispatchFieldEvents(field, eventTypes = ['input', 'change']) {
  eventTypes.forEach(type => field.dispatchEvent(new Event(type, { bubbles: true })));
}

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

/**
 * Set field value using g_form API with fallback
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - Field element
 * @param {string} fieldName - Field name for g_form API
 * @param {string} value - Value to set
 * @returns {Promise<void>}
 */
async function setFieldValueWithGForm(doc, field, fieldName, value) {
  const gForm = getGForm(doc);
  if (gForm) {
    try {
      gForm.setValue(fieldName, '');
      await window.delay(100);
      gForm.setValue(fieldName, value);
      console.log(`✓ Set ${fieldName} to "${value}" using g_form.setValue()`);
      dispatchFieldEvents(field, ['input', 'change', 'blur']);
    } catch (e) {
      console.log(`g_form.setValue failed, using direct field manipulation: ${e.message}`);
      await clearFieldValue(field);
      field.value = value;
      dispatchFieldEvents(field, ['input', 'change', 'blur']);
    }
  } else {
    await clearFieldValue(field);
    field.value = value;
    dispatchFieldEvents(field, ['input', 'change', 'blur']);
  }
}

/**
 * Set a ServiceNow reference field (like assigned_to) with proper focus and event handling
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - The field element
 * @param {string} fieldName - The field name for g_form API
 * @param {string} value - The display value to set
 * @returns {Promise<void>}
 */
async function setReferenceFieldValue(doc, field, fieldName, value) {
  console.log(`Setting reference field ${fieldName} to: ${value}`);
  console.log(`Field details: id=${field.id}, type=${field.type}, current value="${field.value}"`);
  
  // Focus the field first
  field.focus();
  field.dispatchEvent(new Event('focus', { bubbles: true }));
  
  // Set value using g_form API or direct manipulation
  await setFieldValueWithGForm(doc, field, fieldName, value);
}

// Make available globally
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
window.setReferenceFieldValue = setReferenceFieldValue;
