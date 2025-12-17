/**
 * Field setting utilities for alert cleared workflow
 */

/**
 * Set field value using g_form API or direct manipulation
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
 */
function dispatchFieldEvents(field, eventTypes = ['input', 'change']) {
  eventTypes.forEach(type => field.dispatchEvent(new Event(type, { bubbles: true })));
}

// Make available globally
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
