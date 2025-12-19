/**
 * Field setting helpers with g_form fallbacks
 */

function setFieldValue(doc, field, fieldName, value) {
  if (!field) {
    logWarn(`Field "${fieldName}" not provided, skipping setFieldValue`);
    return;
  }

  const gForm = typeof window.getGForm === 'function' ? window.getGForm(doc) : null;
  if (gForm) {
    try {
      gForm.setValue(fieldName, value);
      return;
    } catch (error) {
      logWarn(`g_form.setValue failed for ${fieldName}: ${error.message}`);
      captureException(error, { fieldName, value, action: 'setFieldValue' });
    }
  }

  field.value = value;
}

function setSelectFieldValue(doc, field, fieldName, optionMatcher, fallbackValue) {
  if (!field) {
    logWarn(`Field "${fieldName}" not provided, skipping setSelectFieldValue`);
    return null;
  }

  if (field.tagName === 'SELECT') {
    const matchedOption = Array.from(field.options).find(optionMatcher);
    const valueToApply = matchedOption ? matchedOption.value : fallbackValue;
    setFieldValue(doc, field, fieldName, valueToApply);
    return valueToApply;
  }

  field.value = fallbackValue;
  return fallbackValue;
}

function dispatchFieldEvents(fields, eventTypes = ['input', 'change']) {
  const fieldArray = normalizeFields(fields);
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  fieldArray.forEach(field => {
    if (!field) return;
    types.forEach(type => {
      field.dispatchEvent(new Event(type, { bubbles: true }));
    });
  });
}

function normalizeFields(fields) {
  if (!fields) return [];
  if (Array.isArray(fields)) return fields;
  if (fields instanceof NodeList) return Array.from(fields);
  return [fields];
}

function logWarn(...args) {
  if (window.DebugLogger && typeof window.DebugLogger.warn === 'function') {
    window.DebugLogger.warn(...args);
  } else {
    console.warn(...args);
  }
}

function logError(...args) {
  if (window.DebugLogger && typeof window.DebugLogger.error === 'function') {
    window.DebugLogger.error(...args);
  } else {
    console.error(...args);
  }
}

function captureException(error, context = {}) {
  // Log errors without relying on external trackers
  logError('Field setter error', context, error);
}

window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
