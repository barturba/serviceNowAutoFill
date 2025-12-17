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
      window.DebugLogger.log(`✓ Set ${fieldName} to "${value}" using g_form.setValue()`);
      dispatchFieldEvents(field, ['input', 'change', 'blur']);
    } catch (e) {
      window.DebugLogger.log(`g_form.setValue failed, using direct field manipulation: ${e.message}`);
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
  window.DebugLogger.log(`Setting reference field ${fieldName} to: ${value}`);
  window.DebugLogger.log(`Field details: id=${field.id}, type=${field.type}, current value="${field.value}"`);
  
  // ServiceNow reference fields have two parts:
  // 1. Display field (sys_display.{table}.{fieldName}) - visible autocomplete input
  // 2. Hidden field ({table}.{fieldName}) - stores the sys_id
  
  // Extract table name from form
  const formElement = field.closest('form');
  const formId = formElement ? formElement.id : '';
  const tableName = formId.replace('.do', '');
  
  // Try to find and set the display field first (triggers autocomplete)
  const displayFieldId = `sys_display.${tableName}.${fieldName}`;
  const displayField = doc.getElementById(displayFieldId);
  
  if (displayField) {
    window.DebugLogger.log(`Found display field: ${displayFieldId}`);
    
    // Clear and set the display field
    displayField.value = '';
    displayField.dispatchEvent(new Event('change', { bubbles: true }));
    await window.delay(100);
    
    // Set the new value and trigger autocomplete
    displayField.value = value;
    displayField.focus();
    displayField.dispatchEvent(new Event('focus', { bubbles: true }));
    displayField.dispatchEvent(new Event('input', { bubbles: true }));
    displayField.dispatchEvent(new Event('keydown', { bubbles: true }));
    displayField.dispatchEvent(new Event('keyup', { bubbles: true }));
    
    // Wait for autocomplete to process and populate hidden field
    // TODO: Replace fixed delay with polling for autocomplete completion
    await window.delay(window.TimingConstants.DELAY_ASSIGNMENT_GROUP_PROCESS);
    
    // Trigger blur to finalize autocomplete selection
    displayField.dispatchEvent(new Event('blur', { bubbles: true }));
    displayField.dispatchEvent(new Event('change', { bubbles: true }));
    
    await window.delay(200);
    window.DebugLogger.log(`✓ Display field set, autocomplete should have populated hidden field`);
  } else {
    window.DebugLogger.log(`Display field ${displayFieldId} not found, using fallback`);
  }
  
  // Also use g_form API as fallback/reinforcement
  field.focus();
  field.dispatchEvent(new Event('focus', { bubbles: true }));
  await setFieldValueWithGForm(doc, field, fieldName, value);
}

// Make available globally
window.setFieldValueWithGForm = setFieldValueWithGForm;
window.setReferenceFieldValue = setReferenceFieldValue;


