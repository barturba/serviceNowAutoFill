document.getElementById('submitBtn').addEventListener('click', () => {
    const timeValue = document.getElementById('timeInput').value.trim();
    if (!timeValue) {
      alert('Please enter a time value.');
      return;
    }
  
    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Send message to content script
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillTime', time: timeValue }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error: Could not connect to the page. Ensure you\'re on a ServiceNow ticket page.');
          } else if (response && response.success) {
            alert('Time filled successfully!');
          } else {
            alert('Failed to fill time. Check console for errors.');
          }
        });
      }
    });
  });