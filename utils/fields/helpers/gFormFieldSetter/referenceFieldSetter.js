/**
 * Reference field setting with autocomplete support
 */

async function setReferenceFieldValue(doc, field, fieldName, value) {
  window.DebugLogger.log(`Setting reference field ${fieldName} to: ${value}`);
  
  const formElement = field.closest('form');
  const formId = formElement ? formElement.id : '';
  const tableName = formId.replace('.do', '');
  
  const displayFieldId = `sys_display.${tableName}.${fieldName}`;
  const displayField = doc.getElementById(displayFieldId);
  
  if (displayField) {
    window.DebugLogger.log(`Found display field: ${displayFieldId}`);
    
    displayField.value = '';
    displayField.dispatchEvent(new Event('change', { bubbles: true }));
    await window.delay(100);
    
    displayField.value = value;
    displayField.focus();
    displayField.dispatchEvent(new Event('focus', { bubbles: true }));
    displayField.dispatchEvent(new Event('input', { bubbles: true }));
    displayField.dispatchEvent(new Event('keydown', { bubbles: true }));
    displayField.dispatchEvent(new Event('keyup', { bubbles: true }));
    
    await window.delay(window.TimingConstants.DELAY_ASSIGNMENT_GROUP_PROCESS);
    
    displayField.dispatchEvent(new Event('blur', { bubbles: true }));
    displayField.dispatchEvent(new Event('change', { bubbles: true }));
    
    await window.delay(200);
    window.DebugLogger.log(`✓ Display field set`);
  }
  
  field.focus();
  field.dispatchEvent(new Event('focus', { bubbles: true }));
  await window.setFieldValueWithGForm(doc, field, fieldName, value);
}

window.setReferenceFieldValue = setReferenceFieldValue;

