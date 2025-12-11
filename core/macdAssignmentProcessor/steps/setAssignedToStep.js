/**
 * Step 5: Set Assigned To field
 */

/**
 * Step 5: Set Assigned To field
 * @param {Document} doc - Document containing the form
 * @param {string} agentName - Agent name to assign
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setAssignedToStep(doc, agentName, fieldsToUpdate, errors) {
  console.log('Step 5: Setting Assigned To field...');
  const assignedToField = await window.FieldFinder.findAssignedToField(doc);
  if (assignedToField && agentName) {
    if (await setAssignedToField(doc, assignedToField, agentName)) {
      fieldsToUpdate.push(assignedToField);
      console.log(`✓ Assigned To field set to: ${agentName}`);
    }
  } else {
    if (!assignedToField) {
      errors.push('Assigned To field not found');
      console.log('✗ Assigned To field not found');
    }
    if (!agentName) {
      errors.push('Agent name not provided');
      console.log('✗ Agent name not provided');
    }
  }
}
