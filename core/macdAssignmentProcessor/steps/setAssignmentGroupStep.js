/**
 * Step 3: Set Assignment Group field and wait for processing
 */

/**
 * Step 3: Set Assignment Group field and wait for processing
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setAssignmentGroupStep(doc, fieldsToUpdate, errors) {
  console.log('Step 3: Setting Assignment Group field...');
  const assignmentGroupField = await window.FieldFinder.findAssignmentGroupField(doc);
  if (assignmentGroupField && setAssignmentGroupField(doc, assignmentGroupField)) {
    fieldsToUpdate.push(assignmentGroupField);
    console.log('✓ Assignment Group field set to MS MACD');
    
    console.log('Waiting for ServiceNow to process Assignment Group changes...');
    await window.delay(window.TimingConstants.DELAY_ASSIGNMENT_GROUP_PROCESS);
  } else {
    errors.push('Assignment Group field not found');
    console.log('✗ Assignment Group field not found');
  }
}



