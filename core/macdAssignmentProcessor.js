/**
 * MACD assignment workflow processor
 * Main orchestrator that coordinates field setting steps
 */

async function processMacdAssignment(doc, agentName) {
  console.log('Starting MACD assignment process for agent:', agentName);
  const scrollPositions = window.saveScrollPositions(doc);
  const restoreScroll = () => window.restoreScrollPositions(doc, scrollPositions);

  try {
    const fieldsToUpdate = [];
    const errors = [];

    // Execute field setting steps
    await setCategoryStep(doc, fieldsToUpdate, errors);
    await setSubcategoryStep(doc, fieldsToUpdate, errors);
    await setAssignmentGroupStep(doc, fieldsToUpdate, errors);
    await setAssignedToStep(doc, agentName, fieldsToUpdate, errors);

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
