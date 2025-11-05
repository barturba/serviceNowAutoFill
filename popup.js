// Function to send time to content script
function sendTime(timeValue) {
    if (!timeValue) {
      alert('Please enter or select a time value.');
      return;
    }
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url;
        if (!url.includes('service-now.com') || !url.includes('incident.do')) {
          alert('This extension only works on ServiceNow incident pages. Ensure you\'re on an incident form.');
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillTime', time: timeValue }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error: Could not connect to the page. Ensure the extension is reloaded and you\'re on a ServiceNow incident form. Check console for details.');
          } else if (response && response.success) {
            alert('Time filled successfully!');
          } else {
            alert('Failed to fill time. Check console for errors.');
          }
        });
      }
    });
  }
  
  // Custom submit button
  document.getElementById('submitBtn').addEventListener('click', () => {
    const timeValue = document.getElementById('timeInput').value.trim();
    sendTime(timeValue);
  });
  
  // Preset buttons
  document.querySelectorAll('.preset').forEach(button => {
    button.addEventListener('click', () => {
      const timeValue = button.getAttribute('data-time');
      sendTime(timeValue);
    });
  });