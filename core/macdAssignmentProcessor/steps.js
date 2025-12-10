/**
 * Individual field setting steps for MACD assignment
 */

/**
 * Step 1: Set Category field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setCategoryStep(doc, fieldsToUpdate, errors) {
  console.log('Step 1: Setting Category field...');
  const categoryField = await window.FieldFinder.findCategoryField(doc);
  if (categoryField && setCategoryField(doc, categoryField)) {
    fieldsToUpdate.push(categoryField);
    console.log('✓ Category field set to Collaboration');
  } else {
    errors.push('Category field not found');
    console.log('✗ Category field not found');
  }
}

/**
 * Step 2: Set Subcategory field
 * @param {Document} doc - Document containing the form
 * @param {Array} fieldsToUpdate - Array to track updated fields
 * @param {Array} errors - Array to collect errors
 * @returns {Promise<void>}
 */
async function setSubcategoryStep(doc, fieldsToUpdate, errors) {
  console.log('Step 2: Setting Subcategory field...');
  const subcategoryField = await window.FieldFinder.findSubcategoryField(doc);
  if (subcategoryField && setSubcategoryField(doc, subcategoryField)) {
    fieldsToUpdate.push(subcategoryField);
    console.log('✓ Subcategory field set to MACD');
  } else {
    errors.push('Subcategory field not found');
    console.log('✗ Subcategory field not found');
  }
}

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
    
    // Wait for ServiceNow to process Assignment Group changes
    console.log('Waiting for ServiceNow to process Assignment Group changes...');
    await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_ASSIGNMENT_GROUP_PROCESS));
  } else {
    errors.push('Assignment Group field not found');
    console.log('✗ Assignment Group field not found');
  }
}

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

