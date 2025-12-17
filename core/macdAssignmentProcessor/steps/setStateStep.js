/**
 * Step 5: Set State field to Assigned
 */

/**
 * Step 5: Set State field to Assigned
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setStateStep(doc, fieldsToUpdate, errors) {
  console.log('Step 5: Setting State field to Assigned...');
  const stateField = await window.FieldFinder.findStateField(doc);
  if (stateField && setStateField(doc, stateField)) {
    fieldsToUpdate.push(stateField);
    console.log('✓ State field set to Assigned');
  } else {
    errors.push('State field not found');
    console.log('✗ State field not found');
  }
}

