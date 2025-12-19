function setFieldValue(doc, field, fieldName, value) { const gForm = getGForm(doc); if (gForm) { try { gForm.setValue(fieldName, value); } catch (e) { field.value = value; } } else { field.value = value; } }
function setSelectFieldValue(doc, field, fieldName, optionMatcher, fallbackValue) { if (field.tagName === 'SELECT') { const matchedOption = Array.from(field.options).find(optionMatcher); setFieldValue(doc, field, fieldName, matchedOption ? matchedOption.value : fallbackValue); } else { field.value = fallbackValue; } }
function dispatchFieldEvents(fields, eventTypes = ['input', 'change']) { const fieldArray = Array.isArray(fields) ? fields : [fields]; fieldArray.forEach(field => { if (field) eventTypes.forEach(type => field.dispatchEvent(new Event(type, { bubbles: true }))); }); }
window.setFieldValue = setFieldValue;
window.setSelectFieldValue = setSelectFieldValue;
window.dispatchFieldEvents = dispatchFieldEvents;
