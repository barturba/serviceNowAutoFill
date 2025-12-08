/**
 * Fill work type field utilities
 */

/**
 * Fill work type field
 * @param {Document} doc - Document containing the field
 * @param {HTMLElement} workTypeField - The work type field element
 * @returns {HTMLElement[]} Array of fields that were updated
 */
function fillWorkType(doc, workTypeField) {
  const fieldsToUpdate = [];

  if (workTypeField) {
    if (workTypeField.tagName === 'SELECT') {
      const options = Array.from(workTypeField.options);
      console.log('Available work_type options:', options.map(o => ({ value: o.value, text: o.text })));

      let selectedOption = options.find(o => o.text.toLowerCase().includes('technical troubleshooting')) ||
                          options.find(o => o.text.toLowerCase().includes('troubleshooting')) ||
                          options.find(o => o.text.toLowerCase().includes('diagnosis')) ||
                          options.find(o => o.text.toLowerCase().includes('planned')) ||
                          options.find(o => o.text.toLowerCase().includes('work')) ||
                          options.find(o => o.value && o.value !== '');

      if (selectedOption) {
        if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
          try {
            doc.defaultView.g_form.setValue('u_work_type', selectedOption.value);
            console.log('✓ Set work_type using g_form.setValue() to:', selectedOption.text);
          } catch (e) {
            console.log('g_form.setValue for work_type failed, using direct value:', e.message);
            workTypeField.value = selectedOption.value;
          }
        } else {
          workTypeField.value = selectedOption.value;
        }
        console.log('Set work_type to:', selectedOption.text, '(value:', selectedOption.value + ')');
      } else {
        console.warn('⚠ No suitable work_type option found');
      }
    } else {
      workTypeField.value = 'Technical Troubleshooting & Diagnosis';
      console.log('Set work_type to: Technical Troubleshooting & Diagnosis');
    }
    fieldsToUpdate.push(workTypeField);
  } else {
    console.warn('⚠ work_type field not found, skipping');
  }

  return fieldsToUpdate;
}

// Make available globally
window.fillWorkType = fillWorkType;

