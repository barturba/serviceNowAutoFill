/**
 * g_form API field setting utilities
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

async function setReferenceFieldValue(doc, field, fieldName, value) {
  console.log(`Setting reference field ${fieldName} to: ${value}`);
  console.log(`Field details: id=${field.id}, type=${field.type}, current value="${field.value}"`);
  
  field.focus();
  field.dispatchEvent(new Event('focus', { bubbles: true }));
  await setFieldValueWithGForm(doc, field, fieldName, value);
}

// Make available globally
window.setFieldValueWithGForm = setFieldValueWithGForm;
window.setReferenceFieldValue = setReferenceFieldValue;

