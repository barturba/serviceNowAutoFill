/**
 * Step 2: Set Subcategory field
 */

/**
 * Step 2: Set Subcategory field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setSubcategoryStep(doc, fieldsToUpdate, errors) {
  console.log('Step 2: Setting Subcategory field...');
  
  console.log('Waiting for ServiceNow to load subcategory options...');
  await window.delay(window.TimingConstants.DELAY_SUBCATEGORY_LOAD);
  
  const subcategoryField = await window.FieldFinder.findSubcategoryField(doc);
  if (subcategoryField) {
    const success = await setSubcategoryField(doc, subcategoryField);
    if (success) {
      fieldsToUpdate.push(subcategoryField);
      console.log('✓ Subcategory field set to MACD');
    } else {
      errors.push('Subcategory MACD option not found or not available');
      console.log('✗ Subcategory MACD option not found or not available');
    }
  } else {
    errors.push('Subcategory field not found');
    console.log('✗ Subcategory field not found');
  }
}



