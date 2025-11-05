chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillTime') {
      const timeValue = message.time;
  
      // Replace with the actual selector for the time field in your ServiceNow instance
      // E.g., for Time Worked in Incident form: inspect the element to find it (often something like 'input[name="incident.time_worked"]' or '#time_worked')
      const timeField = document.querySelector('input[name="incident.time_worked"]'); // Adjust this!
  
      if (timeField) {
        timeField.value = timeValue;
  
        // Dispatch events to trigger ServiceNow validations or updates
        timeField.dispatchEvent(new Event('change', { bubbles: true }));
        timeField.dispatchEvent(new Event('input', { bubbles: true }));
  
        console.log('Time filled:', timeValue);
        sendResponse({ success: true });
      } else {
        console.error('Time field not found. Check selector.');
        sendResponse({ success: false });
      }
    }
  });