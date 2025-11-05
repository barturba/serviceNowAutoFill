document.getElementById('fillBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.webNavigation.getAllFrames({ tabId }, (frames) => {
        const iframe = frames.find(frame => frame.url.includes('incident.do'));
        if (!iframe) {
          alert('Incident form iframe not found.');
          return;
        }
  
        const frameId = iframe.frameId;
        chrome.scripting.executeScript({
          target: { tabId, frameIds: [frameId] },
          func: fillTimeFunction,
          args: ['15 minutes']
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error executing in iframe.');
          } else if (results && results[0].result.success) {
            alert('Time filled!');
          } else {
            alert('Failed to fill time. Check console.');
          }
        });
      });
    });
  });
  
  // Injected function to run in iframe
  function fillTimeFunction(timeValue) {
    try {
      // Log what is seen
      console.log('Injected script running in frame:', location.href);
      console.log('Document readyState:', document.readyState);
      const form = document.querySelector('form');
      console.log('Form HTML snippet:', form ? form.outerHTML.substring(0, 2000) + '...' : 'No form found');
      console.log('All input IDs:', Array.from(document.querySelectorAll('input')).map(input => input.id).filter(id => id));
      console.log('All div IDs starting with "element.":', Array.from(document.querySelectorAll('div[id^="element."]')).map(div => div.id));
  
      // Parse duration
      function parseDuration(str) {
        let seconds = 0;
        const parts = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(h|hour|m|min|minute|s|sec|second)?/g) || [];
        parts.forEach(part => {
          const num = parseFloat(part);
          if (isNaN(num)) return;
          if (part.includes('h') || part.includes('hour')) seconds += num * 3600;
          else if (part.includes('m') || part.includes('min') || part.includes('minute')) seconds += num * 60;
          else if (part.includes('s') || part.includes('sec') || part.includes('second')) seconds += num;
          else seconds += num * 60;
        });
        return seconds;
      }
  
      const durationSeconds = parseDuration(timeValue);
      if (durationSeconds <= 0) {
        throw new Error('Invalid time value: ' + timeValue);
      }
  
      // Get fields (updated for custom u_ prefix)
      const timeContainer = document.querySelector('[id="element.incident.time_worked"]');
      if (!timeContainer) throw new Error('Time container not found');
  
      const timeInputs = timeContainer.querySelectorAll('input.form-control');
      if (timeInputs.length < 3) throw new Error('Time inputs not found');
  
      const hourInput = timeInputs[0];
      const minInput = timeInputs[1];
      const secInput = timeInputs[2];
      const hiddenTime = document.querySelector('[id="incident.time_worked"]');
      if (!hiddenTime) throw new Error('Hidden time not found');
  
      const startField = document.querySelector('[id="incident.u_work_start"]');
      if (!startField) throw new Error('Work start not found');
  
      const endField = document.querySelector('[id="incident.u_work_end"]');
      if (!endField) throw new Error('Work end not found');
  
      const workNotesField = document.querySelector('[id="incident.work_notes"]');
      if (!workNotesField) throw new Error('Work notes not found');
  
      // Fill time worked
      const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
      const secs = '00';
  
      hourInput.value = hours;
      minInput.value = mins;
      secInput.value = secs;
      hiddenTime.value = `${hours}:${mins}:${secs}`;
  
      // Fill start/end (using November 05, 2025)
      const now = new Date(2025, 10, 5);
      const endTime = now;
      const startTime = new Date(now.getTime() - durationSeconds * 1000);
  
      function formatDate(d) {
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        const secs = d.getSeconds().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${mins}:${secs}`;
      }
  
      startField.value = formatDate(startTime);
      endField.value = formatDate(endTime);
      workNotesField.value = 'time';
  
      // Dispatch events
      [hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField].forEach(field => {
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('blur', { bubbles: true }));
      });
  
      console.log('Time filled successfully.');
      return { success: true };
    } catch (error) {
      console.error('Error filling time:', error);
      return { success: false };
    }
  }