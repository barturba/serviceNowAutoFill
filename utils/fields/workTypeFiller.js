/**
 * Fill work type field utilities
 */

function findWorkTypeOption(options) {
  return options.find(o => o.text.toLowerCase().includes('technical troubleshooting')) ||
         options.find(o => o.text.toLowerCase().includes('troubleshooting')) ||
         options.find(o => o.text.toLowerCase().includes('diagnosis')) ||
         options.find(o => o.text.toLowerCase().includes('planned')) ||
         options.find(o => o.text.toLowerCase().includes('work')) ||
         options.find(o => o.value && o.value !== '');
}

function fillWorkType(doc, workTypeField) {
  const fieldsToUpdate = [];
  if (!workTypeField) {
    console.warn('⚠ work_type field not found, skipping');
    return fieldsToUpdate;
  }

  if (workTypeField.tagName === 'SELECT') {
    const options = Array.from(workTypeField.options);
    console.log('Available work_type options:', options.map(o => ({ value: o.value, text: o.text })));
    const selectedOption = findWorkTypeOption(options);
    
    if (selectedOption) {
      window.setFieldValue(doc, workTypeField, 'u_work_type', selectedOption.value);
      console.log('Set work_type to:', selectedOption.text, '(value:', selectedOption.value + ')');
    } else {
      console.warn('⚠ No suitable work_type option found');
    }
  } else {
    workTypeField.value = 'Technical Troubleshooting & Diagnosis';
    console.log('Set work_type to: Technical Troubleshooting & Diagnosis');
  }
  fieldsToUpdate.push(workTypeField);
  return fieldsToUpdate;
}

// Make available globally
window.fillWorkType = fillWorkType;

