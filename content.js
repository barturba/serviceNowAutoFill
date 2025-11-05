console.log('Content script loaded in frame:', location.href); // For debugging

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillTime') {
    try {
      const timeValue = message.time;

      // Parse the time input to seconds
      function parseDuration(str) {
        let seconds = 0;
        const parts = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(h|hour|m|min|minute|s|sec|second)?/g) || [];
        parts.forEach(part => {
          const num = parseFloat(part);
          if (isNaN(num)) return;
          if (part.includes('h') || part.includes('hour')) seconds += num * 3600;
          else if (part.includes('m') || part.includes('min') || part.includes('minute')) seconds += num * 60;
          else if (part.includes('s') || part.includes('sec') || part.includes('second')) seconds += num;
          else seconds += num * 60; // Default to minutes
        });
        return seconds;
      }

      const durationSeconds = parseDuration(timeValue);
      if (durationSeconds <= 0) {
        throw new Error('Invalid time value: ' + timeValue);
      }

      // Selectors for the fields
      const timeField = document.querySelector('#incident\\.time_worked');
      const startField = document.querySelector('#incident\\.work_start');
      const endField = document.querySelector('#incident\\.work_end');
      const workNotesField = document.querySelector('#incident\\.work_notes');

      if (!timeField || !startField || !endField || !workNotesField) {
        console.warn('Not in incident form frame or fields not found.');
        sendResponse({ success: false });
        return true; // Keep port open for async if needed
      }

      // Calculate start and end times (using provided current date: November 05, 2025)
      const now = new Date(2025, 10, 5); // Month is 0-indexed (10 = November)
      const endTime = now;
      const startTime = new Date(now.getTime() - durationSeconds * 1000);

      // Format dates to MM/dd/yyyy HH:mm:ss
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
      timeField.value = timeValue;
      startField.value = formatDate(startTime);
      endField.value = formatDate(endTime);
      workNotesField.value = 'time';

      // Dispatch events
      [timeField, startField, endField, workNotesField].forEach(field => {
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      });

      console.log('Time filled:', { time: timeValue, start: startField.value, end: endField.value, workNotes: workNotesField.value });
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error in content script:', error);
      sendResponse({ success: false });
    }
    return true; // Async response
  }
});