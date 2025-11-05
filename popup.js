// Get all time buttons and add click listeners
document.querySelectorAll('.time-btn').forEach(button => {
  button.addEventListener('click', () => {
    const timeValue = button.getAttribute('data-time');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      // Inject script into the main tab (not specific frame)
      chrome.scripting.executeScript({
        target: { tabId },
        func: fillTimeInNestedFrame,
        args: [timeValue]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert('Error: ' + chrome.runtime.lastError.message);
        } else if (results && results[0].result) {
          const result = results[0].result;
          if (result.success) {
            // Close popup on success
            window.close();
          } else {
            alert('Failed: ' + (result.error || 'Unknown error'));
          }
        } else {
          // Close popup if no results (script injected successfully)
          window.close();
        }
      });
    });
  });
});

// Function that runs in the page context to access the nested iframe
function fillTimeInNestedFrame(timeValue) {
  return new Promise((resolve) => {
    console.log('Starting fillTimeInNestedFrame...');
    console.log('Current URL:', window.location.href);

    // Helper function to process incident form in any document context
    async function processIncidentForm(doc) {
      console.log('=== PROCESSING INCIDENT FORM ===');
      console.log('Document URL:', doc.location.href);
      console.log('Document readyState:', doc.readyState);

      // Helper to wait for element
      function waitForElement(selector, timeout = 10000) {
        return new Promise((resolveWait, rejectWait) => {
          const element = doc.querySelector(selector);
          if (element) {
            resolveWait(element);
            return;
          }

          const observer = new MutationObserver(() => {
            const element = doc.querySelector(selector);
            if (element) {
              observer.disconnect();
              resolveWait(element);
            }
          });

          observer.observe(doc.body || doc.documentElement, {
            childList: true,
            subtree: true
          });

          setTimeout(() => {
            observer.disconnect();
            rejectWait(new Error(`Timeout waiting for ${selector}`));
          }, timeout);
        });
      }

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

      try {
        const durationSeconds = parseDuration(timeValue);
        if (durationSeconds <= 0) {
          throw new Error('Invalid time value: ' + timeValue);
        }

        // Look for time_worked field
        let timeContainer = doc.querySelector('[id*="time_worked"]');
        if (!timeContainer) {
          console.log('time_worked not immediately found, waiting...');
          timeContainer = await waitForElement('input[id*="time_worked"], div[id*="time_worked"]');
        }
        console.log('Found time container:', timeContainer.id);

        // Find parent div if we got an input
        if (timeContainer.tagName === 'INPUT') {
          timeContainer = timeContainer.closest('div[id*="time_worked"]') || timeContainer.parentElement;
        }

        const timeInputs = timeContainer.querySelectorAll('input.form-control');
        console.log('Found time inputs:', timeInputs.length);

        if (timeInputs.length < 3) {
          throw new Error(`Expected 3 time inputs, found ${timeInputs.length}`);
        }

        const hourInput = timeInputs[0];
        const minInput = timeInputs[1];
        const secInput = timeInputs[2];

        // Find hidden time field
        const hiddenTime = doc.querySelector('[id$="time_worked"]') ||
                          doc.querySelector('input[name*="time_worked"]');
        if (!hiddenTime) throw new Error('Hidden time field not found');
        console.log('Found hidden time:', hiddenTime.id);

        // Find work start/end fields - look for actual input fields, not wrappers
        // Debug: log all elements with work_start/work_end in ID
        const allWorkStartElements = doc.querySelectorAll('[id*="work_start"]');
        const allWorkEndElements = doc.querySelectorAll('[id*="work_end"]');
        const allWorkNotesElements = doc.querySelectorAll('[id*="work_notes"]');

        console.log('All work_start elements:', Array.from(allWorkStartElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));
        console.log('All work_end elements:', Array.from(allWorkEndElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));
        console.log('All work_notes elements:', Array.from(allWorkNotesElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));

        // Try multiple selectors in order of specificity
        let startField = doc.querySelector('input[id="incident.u_work_start"]') ||
                        doc.querySelector('input[name="incident.u_work_start"]') ||
                        doc.querySelector('input[id$="u_work_start"]') ||
                        doc.querySelector('input[id*="work_start"]');

        if (!startField) {
          console.log('Waiting for work_start field...');
          try {
            startField = await waitForElement('input[id="incident.u_work_start"], input[id$="u_work_start"], input[id*="work_start"]');
          } catch (e) {
            console.log('Could not find work_start input field:', e.message);
          }
        }
        console.log('Found work_start:', startField?.id, 'tag:', startField?.tagName, 'type:', startField?.type);

        let endField = doc.querySelector('input[id="incident.u_work_end"]') ||
                      doc.querySelector('input[name="incident.u_work_end"]') ||
                      doc.querySelector('input[id$="u_work_end"]') ||
                      doc.querySelector('input[id*="work_end"]');

        if (!endField) {
          console.log('Waiting for work_end field...');
          try {
            endField = await waitForElement('input[id="incident.u_work_end"], input[id$="u_work_end"], input[id*="work_end"]');
          } catch (e) {
            console.log('Could not find work_end input field:', e.message);
          }
        }
        console.log('Found work_end:', endField?.id, 'tag:', endField?.tagName, 'type:', endField?.type);

        // Work notes - try to find textarea or input, not wrapper div
        let workNotesField = doc.querySelector('textarea[id="incident.work_notes"]') ||
                            doc.querySelector('textarea[id$="work_notes"]') ||
                            doc.querySelector('input[id="incident.work_notes"]') ||
                            doc.querySelector('textarea[id*="work_notes"]') ||
                            doc.querySelector('input[id*="work_notes"]');

        if (!workNotesField) {
          console.log('Waiting for work_notes field...');
          try {
            workNotesField = await waitForElement('textarea[id*="work_notes"], input[id*="work_notes"]');
          } catch (e) {
            console.log('Could not find work_notes field:', e.message);
          }
        }
        console.log('Found work_notes:', workNotesField?.id, 'tag:', workNotesField?.tagName);

        // Fill time worked
        const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = '00';

        hourInput.value = hours;
        minInput.value = mins;
        secInput.value = secs;
        hiddenTime.value = `${hours}:${mins}:${secs}`;

        // Fill start/end times
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

        // Set work start/end times if fields exist
        const fieldsToUpdate = [hourInput, minInput, secInput, hiddenTime];

        if (startField) {
          startField.value = formatDate(startTime);
          console.log('Set work_start to:', formatDate(startTime));
          fieldsToUpdate.push(startField);
        } else {
          console.warn('⚠ work_start field not found, skipping');
        }

        if (endField) {
          endField.value = formatDate(endTime);
          console.log('Set work_end to:', formatDate(endTime));
          fieldsToUpdate.push(endField);
        } else {
          console.warn('⚠ work_end field not found, skipping');
        }

        if (workNotesField) {
          workNotesField.value = 'updating time';
          console.log('Set work_notes to: updating time');
          fieldsToUpdate.push(workNotesField);
        } else {
          console.warn('⚠ work_notes field not found, skipping');
        }

        // Dispatch events on all fields that were successfully found and updated
        console.log('Dispatching events on', fieldsToUpdate.length, 'fields');
        fieldsToUpdate.forEach(field => {
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('blur', { bubbles: true }));
        });

        console.log('✓ Time filled successfully!');
        resolve({ success: true });
      } catch (error) {
        console.error('✗ Error filling time:', error);
        resolve({ success: false, error: error.message });
      }
    }

    // First, check if we're already in the incident form (no iframe needed)
    const directTimeField = document.querySelector('[id*="time_worked"]');
    const directWorkStart = document.querySelector('[id*="work_start"]');

    if (directTimeField || directWorkStart) {
      console.log('✓ Found incident form fields directly in current document (no iframe needed)');
      // Process fields directly without iframe
      processIncidentForm(document);
      return;
    }

    console.log('Fields not in current document, searching for iframe...');

    // Helper to find iframe in both regular DOM and shadow DOM
    function findIframeInDOM(timeout = 15000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        // List of all possible iframe selectors for ServiceNow
        const iframeSelectors = [
          'iframe#gsft_main',
          'iframe[name="gsft_main"]',
          'iframe[id*="gsft"]',
          'iframe[name*="gsft"]',
          'iframe[title*="Main"]',
          'iframe[title*="Content"]',
          'iframe[src*="incident"]',
          'iframe[src*="sys_id"]',
          'iframe'  // fallback: any iframe
        ];

        // Helper to check if iframe contains incident form
        function isIncidentFrame(iframe) {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) return false;

            // Check for incident form fields
            const hasTimeWorked = !!doc.querySelector('[id*="time_worked"]');
            const hasIncidentForm = !!doc.querySelector('form[action*="incident"]') ||
                                   doc.location.href.includes('incident');
            const hasWorkStart = !!doc.querySelector('[id*="work_start"]');

            return hasTimeWorked || hasIncidentForm || hasWorkStart;
          } catch (e) {
            // Cross-origin or access denied - can't check content
            return false;
          }
        }

        // Helper to recursively search shadow DOM and regular DOM
        function findInShadowRoots(root, depth = 0) {
          const indent = '  '.repeat(depth);
          console.log(`${indent}Searching at depth ${depth}, root:`, root.constructor.name);

          // Try all selectors in current root
          for (const selector of iframeSelectors) {
            try {
              const iframes = root.querySelectorAll(selector);
              if (iframes.length > 0) {
                console.log(`${indent}Found ${iframes.length} iframe(s) with selector '${selector}'`);
              }

              for (const iframe of iframes) {
                console.log(`${indent}Checking iframe:`, {
                  selector,
                  id: iframe.id,
                  name: iframe.name,
                  src: iframe.src?.substring(0, 100),
                  title: iframe.title
                });

                // If we can access the iframe content, verify it's the right one
                if (isIncidentFrame(iframe)) {
                  console.log(`${indent}✓ Found incident iframe with content verification!`);
                  return iframe;
                }

                // For specific ServiceNow iframe identifiers, trust them
                if (iframe.id === 'gsft_main' || iframe.name === 'gsft_main') {
                  console.log(`${indent}✓ Found gsft_main iframe!`);
                  return iframe;
                }
              }
            } catch (e) {
              console.log(`${indent}Error with selector '${selector}':`, e.message);
            }
          }

          // Recursively search in all shadow roots
          const allElements = Array.from(root.querySelectorAll('*'));
          console.log(`${indent}Checking ${allElements.length} elements for shadow roots...`);

          let shadowRootsFound = 0;
          for (const element of allElements) {
            if (element.shadowRoot) {
              shadowRootsFound++;
              console.log(`${indent}Found shadow root in:`, element.tagName, element.id || element.className);
              const found = findInShadowRoots(element.shadowRoot, depth + 1);
              if (found) return found;
            }
          }

          console.log(`${indent}Found ${shadowRootsFound} shadow roots at this level`);
          return null;
        }

        // Retry logic with proper promise chaining
        function searchForIframe() {
          console.log('=== SEARCHING FOR IFRAME ===');

          // First, search regular DOM
          console.log('Searching regular DOM...');
          let iframe = findInShadowRoots(document);

          if (iframe) {
            console.log('✓ Found iframe!');
            resolve(iframe);
            return;
          }

          // Log all iframes on page for debugging
          const allIframes = document.querySelectorAll('iframe');
          console.log('All iframes on page:', allIframes.length);
          allIframes.forEach((frame, idx) => {
            console.log(`  Iframe ${idx}:`, {
              id: frame.id,
              name: frame.name,
              src: frame.src?.substring(0, 100),
              title: frame.title,
              className: frame.className
            });
          });

          // If not found and not timed out, try again
          if (Date.now() - startTime < timeout) {
            console.log('Iframe not found yet, retrying in 500ms...');
            setTimeout(searchForIframe, 500);
          } else {
            console.error('✗ TIMEOUT: Could not find iframe after', timeout, 'ms');
            reject(new Error('Timeout: iframe not found after searching both regular and shadow DOM'));
          }
        }

        // Start the search
        searchForIframe();
      });
    }

    // Wait for iframe to exist, then process it
    findIframeInDOM()
      .then(iframe => {
        console.log('✓ Found iframe:', iframe);

        // Wait for iframe content to load
        function waitForIframeReady() {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            if (!iframeDoc) {
              console.log('Cannot access iframe document yet, waiting...');
              setTimeout(waitForIframeReady, 500);
              return;
            }

            if (iframeDoc.readyState !== 'complete') {
              console.log('Iframe document not ready (readyState:', iframeDoc.readyState + '), waiting...');
              setTimeout(waitForIframeReady, 500);
              return;
            }

            console.log('✓ Iframe loaded and ready');
            // Use the shared processing function
            processIncidentForm(iframeDoc);
          } catch (error) {
            console.error('Error accessing iframe:', error);
            resolve({ success: false, error: 'Cannot access iframe: ' + error.message });
          }
        }

        // Start processing - wait for load event or try immediately
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          console.log('Iframe already loaded, processing immediately');
          waitForIframeReady();
        } else {
          console.log('Waiting for iframe load event');
          iframe.addEventListener('load', waitForIframeReady);
          // Also try after a delay in case load event already fired
          setTimeout(waitForIframeReady, 1000);
        }
      })
      .catch(error => {
        console.error('Error finding iframe:', error);
        resolve({ success: false, error: error.message });
      });
  });
}
