/**
 * Basic field setting with g_form API
 */

async function setFieldValueWithGForm(doc, field, fieldName, value) {
  const gForm = window.getGForm(doc);
  if (gForm) {
    try {
      gForm.setValue(fieldName, '');
      await window.delay(100);
      gForm.setValue(fieldName, value);
      window.DebugLogger.log(`✓ Set ${fieldName} using g_form.setValue()`);
      window.dispatchFieldEvents(field, ['input', 'change', 'blur']);
    } catch (e) {
      window.DebugLogger.log(`g_form.setValue failed: ${e.message}`);
      await window.clearFieldValue(field);
      field.value = value;
      window.dispatchFieldEvents(field, ['input', 'change', 'blur']);
    }
  } else {
    await window.clearFieldValue(field);
    field.value = value;
    window.dispatchFieldEvents(field, ['input', 'change', 'blur']);
  }
}

window.setFieldValueWithGForm = setFieldValueWithGForm;

