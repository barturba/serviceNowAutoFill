chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillTime') {
      const timeValue = message.time;
  
      // Parse the time input to seconds (supports "2h 30m", "2.5 hours", "15 minutes", etc.)
      function parseDuration(str) {
        let seconds = 0;
        const parts = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(h|hour|m|min|minute|s|sec|second)?/g) || [];
        parts.forEach(part => {
          const num = parseFloat(part);
          if (isNaN(num)) return;
          if (part.includes('h') || part.includes('hour')) seconds += num * 3600;
          else if (part.includes('m') || part.includes('min') || part.includes('minute')) seconds += num * 60;
          else if (part.includes('s') || part.includes('sec') || part.includes('second')) seconds += num;
          else seconds += num * 60; // Default to minutes if no unit
        });
        return seconds;
      }
  
      const durationSeconds = parseDuration(timeValue);
      if (durationSeconds <= 0) {
        console.error('Invalid time value:', timeValue);
        sendResponse({ success: false });
        return;
      }
  
      // Get the document (check for iframe in Unified Navigation)
      const iframe = document.getElementById('gsft_main');
      const doc = iframe ? (iframe.contentDocument || iframe.contentWindow.document) : document;
  
      if (!doc) {
        console.error('Could not access form document.');
        sendResponse({ success: false });
        return;
      }
  
      // Selectors for the fields (adjust if your instance uses different IDs/classes)
      const timeField = doc.querySelector('#incident\\.time_worked');
      const startField = doc.querySelector('#incident\\.work_start');
      const endField = doc.querySelector('#incident\\.work_end');
  
      if (!timeField || !startField || !endField) {
        console.error('One or more fields not found. Check selectors.');
        sendResponse({ success: false });
        return;
      }
  
      // Calculate start and end times
      const now = new Date();
      const endTime = now;
      const startTime = new Date(now.getTime() - durationSeconds * 1000);
  
      // Format dates to ServiceNow's default (MM/dd/yyyy HH:mm:ss) – adjust if your user prefs differ
      function formatDate(d) {
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const secs = d.getSeconds().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${mins}:${secs}`;
      }
  
      // Set values
      timeField.value = timeValue; // e.g., "15 minutes" – ServiceNow parses this
      startField.value = formatDate(startTime);
      endField.value = formatDate(endTime);
  
      // Dispatch events to trigger validations/updates
      [timeField, startField, endField].forEach(field => {
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      });
  
      console.log('Time filled:', { time: timeValue, start: startField.value, end: endField.value });
      sendResponse({ success: true });
    }
  });