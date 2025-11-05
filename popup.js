document.getElementById('fillBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'fillTime', time: '15 minutes' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error connecting to page.');
          } else if (response && response.success) {
            alert('Time filled!');
          } else {
            alert('Failed to fill time.');
          }
        });
      }
    });
  });