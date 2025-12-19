/**
 * Field setting helpers with g_form fallbacks
 */

const getFieldFinderLogger = () => window.FieldFinder || {};
const logWarn = (...args) => {
  const ff = getFieldFinderLogger();
  return typeof ff.logWarn === 'function' ? ff.logWarn(...args) : console.warn(...args);
};
const logError = (...args) => {
  const ff = getFieldFinderLogger();
  return typeof ff.logError === 'function' ? ff.logError(...args) : console.error(...args);
};
const captureException = (error, context = {}) => {
  const ff = getFieldFinderLogger();
  return typeof ff.captureException === 'function'
    ? ff.captureException(error, context)
    : logError('Field setter error', context, error);
};

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
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
