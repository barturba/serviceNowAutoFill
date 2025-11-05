console.log('Content script loaded in frame:', location.href);

// Function to log page details
function logPageDetails() {
  console.log('Logging page details...');
  console.log('Document readyState:', document.readyState);
  const form = document.querySelector('form');
  console.log('Form HTML snippet:', form ? form.outerHTML.substring(0, 2000) + '...' : 'No form found');
  console.log('All input IDs:', Array.from(document.querySelectorAll('input')).map(input => input.id).filter(id => id));
  console.log('All div IDs starting with "element.":', Array.from(document.querySelectorAll('div[id^="element."]')).map(div => div.id));
}

// Log on initial load
logPageDetails();

// Set up MutationObserver to log on DOM changes
const observer = new MutationObserver((mutations) => {
  console.log('DOM changed:', mutations.length, 'mutations detected.');
  logPageDetails(); // Re-log on change
});
observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// Also log on window load
window.addEventListener('load', () => {
  console.log('Window loaded.');
  logPageDetails();
});

// Existing fill logic (runs only on message)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillTime') {
    try {
      if (!location.href.includes('incident.do')) {
        sendResponse({ success: false });
        return true;
      }

      const timeValue = message.time;
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

      // Function to get fields or null
      function getFields() {
        const timeContainer = document.querySelector('[id="element.incident.time_worked"]');
        if (!timeContainer) return null;

        const timeInputs = timeContainer.querySelectorAll('input.form-control');
        if (timeInputs.length < 3) return null;

        const hourInput = timeInputs[0];
        const minInput = timeInputs[1];
        const secInput = timeInputs[2];
        const hiddenTime = document.querySelector('[id="incident.time_worked"]');
        const startField = document.querySelector('[id="incident.work_start"]');
        const endField = document.querySelector('[id="incident.work_end"]');
        const workNotesField = document.querySelector('[id="incident.work_notes"]');

        if (!hiddenTime || !startField || !endField || !workNotesField) return null;

        return { hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField };
      }

      let fields = getFields();
      if (fields) {
        fillFields(fields);
        return true;
      }

      console.log('Fields not found initially for fill.');
      const fillObserver = new MutationObserver(() => {
        fields = getFields();
        if (fields) {
          fillObserver.disconnect();
          fillFields(fields);
        }
      });

      fillObserver.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        fillObserver.disconnect();
        if (!fields) {
          console.error('Fields not found after timeout for fill.');
          sendResponse({ success: false });
        }
      }, 60000);

      function fillFields({ hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField }) {
        const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = '00';

        hourInput.value = hours;
        minInput.value = mins;
        secInput.value = secs;
        hiddenTime.value = `${hours}:${mins}:${secs}`;

        const now = new Date();
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

        [hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField].forEach(field => {
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('blur', { bubbles: true }));
        });

        console.log('Time filled:', { time: timeValue, hidden: hiddenTime.value, hour: hourInput.value, min: minInput.value, sec: secInput.value, start: startField.value, end: endField.value, workNotes: workNotesField.value });
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error('Error in content script:', error);
      sendResponse({ success: false });
    }
    return true;
  }
});