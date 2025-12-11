/**
 * Button handler setup functions
 */

function setupTimeButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrame', 
        (tv, ct) => window.fillTimeInNestedFrame?.(tv, ct) || 
          Promise.reject(new Error('fillTimeInNestedFrame not found')),
        [button.getAttribute('data-time'), getCommentText()]);
    }, button);
  });
}

function setupTimeSaveButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('fillTimeInNestedFrameAndSave',
        (tv, ct) => window.fillTimeInNestedFrameAndSave?.(tv, ct) ||
          Promise.reject(new Error('fillTimeInNestedFrameAndSave not found')),
        [button.getAttribute('data-time'), getCommentText()]);
    }, button);
  });
}

function setupAlertClearedButtonHandler(button) {
  button.addEventListener('click', () => {
    executeWithProgressTracking(() => {
      injectAndExecute('processAlertCleared',
        () => window.processAlertCleared?.() || Promise.reject(new Error('processAlertCleared not found')));
    }, button);
  });
}

function setupMacdAssignmentButtonHandler(button) {
  button.addEventListener('click', async () => {
    await executeWithProgressTracking(async () => {
      const agentSelect = document.getElementById('taskmaster-agent-input');
      const agentName = agentSelect ? agentSelect.value.trim() : '';
      if (!agentName) {
        showError('Please select an agent');
        return;
      }
      await saveTaskmasterAgent(agentName);
      injectAndExecute('processMacdAssignment',
        (n) => window.processMacdAssignment?.(n) || Promise.reject(new Error('processMacdAssignment not found')), [agentName]);
    }, button);
  });
}
