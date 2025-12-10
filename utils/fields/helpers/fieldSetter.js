/**
 * Field setting utilities for alert cleared workflow
 */

function setFieldValue(doc, field, fieldName, value) {
  const gForm = doc.defaultView?.g_form;
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

function setSelectFieldValue(doc, field, fieldName, optionMatcher, fallbackValue) {
  if (field.tagName === 'SELECT') {
    const matchedOption = Array.from(field.options).find(optionMatcher);
    setFieldValue(doc, field, fieldName, matchedOption ? matchedOption.value : fallbackValue);
  } else {
    field.value = fallbackValue;
  }
}

function dispatchFieldEvents(field, eventTypes = ['input', 'change']) {
  eventTypes.forEach(type => field.dispatchEvent(new Event(type, { bubbles: true })));
}

/**
 * Set a ServiceNow reference field (like assigned_to) with proper focus and event handling
 * @param {Document} doc - Document containing the form
 * @param {HTMLElement} field - The field element
 * @param {string} fieldName - The field name for g_form API
 * @param {string} value - The display value to set
 */
function setReferenceFieldValue(doc, field, fieldName, value) {
  console.log(`Setting reference field ${fieldName} to: ${value}`);
  
  // Focus the field first
  field.focus();
  field.dispatchEvent(new Event('focus', { bubbles: true }));
  
  // Set the value using g_form API if available
  const gForm = doc.defaultView?.g_form;
  if (gForm) {
    try {
      gForm.setValue(fieldName, value);
      console.log(`✓ Set ${fieldName} using g_form.setValue()`);
    } catch (e) {
      console.log(`g_form.setValue failed, using direct field manipulation: ${e.message}`);
      // Fallback to direct value setting
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else {
    // No g_form API, use direct manipulation
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Dispatch change and blur events to trigger ServiceNow's client-side logic
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Make available globally
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
window.setReferenceFieldValue = setReferenceFieldValue;

