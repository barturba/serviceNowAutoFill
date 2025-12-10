/**
 * MACD assignment workflow processor
 */

async function processMacdAssignment(doc, agentName) {
  console.log('Starting MACD assignment process for agent:', agentName);
  const scrollPositions = window.saveScrollPositions(doc);
  const restoreScroll = () => window.restoreScrollPositions(doc, scrollPositions);

  try {
    const fieldsToUpdate = [];
    const errors = [];

    // Step 1: Find and set Category field
    console.log('Step 1: Setting Category field...');
    const categoryField = await window.FieldFinder.findCategoryField(doc);
    if (categoryField) {
      window.setSelectFieldValue(doc, categoryField, 'category', o => o.text === 'Collaboration' || o.value === 'Collaboration', 'Collaboration');
      window.dispatchFieldEvents(categoryField, ['input', 'change']);
      fieldsToUpdate.push(categoryField);
      console.log('✓ Category field set to Collaboration');
    } else {
      errors.push('Category field not found');
      console.log('✗ Category field not found');
    }

    // Step 2: Find and set Subcategory field
    console.log('Step 2: Setting Subcategory field...');
    const subcategoryField = await window.FieldFinder.findSubcategoryField(doc);
    if (subcategoryField) {
      window.setSelectFieldValue(doc, subcategoryField, 'subcategory', o => o.text === 'MACD' || o.value === 'MACD', 'MACD');
      window.dispatchFieldEvents(subcategoryField, ['input', 'change']);
      fieldsToUpdate.push(subcategoryField);
      console.log('✓ Subcategory field set to MACD');
    } else {
      errors.push('Subcategory field not found');
      console.log('✗ Subcategory field not found');
    }

    // Step 3: Find and set Assignment Group field (must be set before Assigned To)
    console.log('Step 3: Setting Assignment Group field...');
    const assignmentGroupField = await window.FieldFinder.findAssignmentGroupField(doc);
    if (assignmentGroupField) {
      window.setSelectFieldValue(doc, assignmentGroupField, 'assignment_group', o => o.text === 'MS MACD' || o.value === 'MS MACD', 'MS MACD');
      window.dispatchFieldEvents(assignmentGroupField, ['input', 'change']);
      fieldsToUpdate.push(assignmentGroupField);
      console.log('✓ Assignment Group field set to MS MACD');
      
      // Step 4: Wait for ServiceNow to process Assignment Group changes
      // This allows ServiceNow's client-side logic to populate Assigned To field
      console.log('Waiting for ServiceNow to process Assignment Group changes...');
      await new Promise(resolve => setTimeout(resolve, window.TimingConstants.DELAY_ASSIGNMENT_GROUP_PROCESS));
    } else {
      errors.push('Assignment Group field not found');
      console.log('✗ Assignment Group field not found');
    }

    // Step 5: Find and set Assigned To field (after Assignment Group has been processed)
    console.log('Step 4: Setting Assigned To field...');
    const assignedToField = await window.FieldFinder.findAssignedToField(doc);
    if (assignedToField && agentName) {
      // Use the reference field helper for proper handling
      window.setReferenceFieldValue(doc, assignedToField, 'assigned_to', agentName);
      fieldsToUpdate.push(assignedToField);
      console.log(`✓ Assigned To field set to: ${agentName}`);
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

    // Dispatch final events on all updated fields
    fieldsToUpdate.forEach(field => window.dispatchFieldEvents(field, ['input', 'change']));
    restoreScroll();
    
    if (errors.length > 0) {
      console.log('Completed with warnings:', errors.join(', '));
      return { success: true, warnings: errors };
    }
    
    console.log('✓ MACD assignment completed successfully');
    return { success: true };
  } catch (error) {
    restoreScroll();
    console.error('✗ MACD assignment failed:', error);
    return { success: false, error: error.message };
  }
}

window.FormFiller = window.FormFiller || {};
window.FormFiller.processMacdAssignment = processMacdAssignment;

