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

// Make available globally
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;

