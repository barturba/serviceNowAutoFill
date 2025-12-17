/**
 * MACD assignment workflow processor
 * Main orchestrator that coordinates field setting steps
 */

async function processMacdAssignment(doc, agentName) {
  window.DebugLogger.log('Starting MACD assignment process for agent:', agentName);
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
    await setStateStep(doc, fieldsToUpdate, errors);

    // Dispatch final events on all updated fields
    window.dispatchFieldEvents(fieldsToUpdate, ['input', 'change']);
    restoreScroll();
    
    window.DebugLogger.log('✓ MACD assignment completed successfully');
    return window.ErrorHandler.createSuccess(errors.length > 0 ? errors : undefined);
  } catch (error) {
    restoreScroll();
    return window.ErrorHandler.handleError(error, 'MACD assignment');
  }
}

window.FormFiller = window.FormFiller || {};
window.FormFiller.processMacdAssignment = processMacdAssignment;
