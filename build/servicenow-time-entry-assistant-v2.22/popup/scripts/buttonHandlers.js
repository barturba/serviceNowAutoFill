/**
 * Button handler setup utilities
 */

function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('fillTimeInNestedFrame', 
      (timeValue, commentText) => window.fillTimeInNestedFrame?.(timeValue, commentText) || 
        Promise.reject(new Error('fillTimeInNestedFrame not found')),
      [button.getAttribute('data-time'), getCommentText()]);
  });
}

function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('fillTimeInNestedFrameAndSave',
      (timeValue, commentText) => window.fillTimeInNestedFrameAndSave?.(timeValue, commentText) ||
        Promise.reject(new Error('fillTimeInNestedFrameAndSave not found')),
      [button.getAttribute('data-time'), getCommentText()]);
  });
}

function setupAlertClearedButtonHandler(button) {
  button.addEventListener('click', () => {
    injectAndExecute('processAlertCleared',
      () => window.processAlertCleared?.() || Promise.reject(new Error('processAlertCleared not found')));
  });
}

function setupMacdAssignmentButtonHandler(button) {
  button.addEventListener('click', async () => {
    const agentInput = document.getElementById('taskmaster-agent-input');
    const agentName = agentInput ? agentInput.value.trim() : '';
    
    if (!agentName) {
      showError('Please select or enter a taskmaster agent');
      return;
    }

    // Save the agent selection
    await saveTaskmasterAgent(agentName);

    injectAndExecute('processMacdAssignment',
      (agentName) => window.processMacdAssignment?.(agentName) || Promise.reject(new Error('processMacdAssignment not found')),
      [agentName]);
  });
}

