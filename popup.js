document.getElementById('fillBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Inject script into the main tab (not specific frame)
    chrome.scripting.executeScript({
      target: { tabId },
      func: fillTimeInNestedFrame,
      args: ['15 minutes']
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        alert('Error: ' + chrome.runtime.lastError.message);
      } else if (results && results[0].result) {
        const result = results[0].result;
        if (result.success) {
          alert('Time filled successfully!');
        } else {
          alert('Failed: ' + (result.error || 'Unknown error'));
        }
      }
    });
  });
});

// Helper function to process incident form in any document context
async function processIncidentForm(doc, timeValue, resolve) {
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

    // Find work start/end fields
    let startField = doc.querySelector('input[id*="work_start"]') ||
                    doc.querySelector('input[name*="work_start"]');
    if (!startField) {
      console.log('Waiting for work_start field...');
      startField = await waitForElement('input[id*="work_start"]');
    }
    console.log('Found work_start:', startField?.id);

    let endField = doc.querySelector('input[id*="work_end"]') ||
                  doc.querySelector('input[name*="work_end"]');
    if (!endField) {
      console.log('Waiting for work_end field...');
      endField = await waitForElement('input[id*="work_end"]');
    }
    console.log('Found work_end:', endField?.id);

    const workNotesField = doc.querySelector('[id*="work_notes"]') ||
                          await waitForElement('[id*="work_notes"]');
    console.log('Found work_notes:', workNotesField.id);

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

    startField.value = formatDate(startTime);
    endField.value = formatDate(endTime);
    workNotesField.value = 'updating time';

    console.log('Set work_start to:', formatDate(startTime));
    console.log('Set work_end to:', formatDate(endTime));

    // Dispatch events
    const fieldsToUpdate = [hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField];
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

// Function that runs in the page context to access the nested iframe
function fillTimeInNestedFrame(timeValue) {
  return new Promise((resolve) => {
    console.log('Starting fillTimeInNestedFrame...');
    console.log('Current URL:', window.location.href);

    // First, check if we're already in the incident form (no iframe needed)
    const directTimeField = document.querySelector('[id*="time_worked"]');
    const directWorkStart = document.querySelector('[id*="work_start"]');

    if (directTimeField || directWorkStart) {
      console.log('✓ Found incident form fields directly in current document (no iframe needed)');
      // Process fields directly without iframe
      processIncidentForm(document, timeValue, resolve);
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
        console.log('Found iframe:', iframe);

        // Wait for iframe content to load
        function processIframe() {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            if (!iframeDoc) {
              console.log('Cannot access iframe document yet, waiting...');
              setTimeout(processIframe, 500);
              return;
            }

            if (iframeDoc.readyState !== 'complete') {
              console.log('Iframe document not ready (readyState:', iframeDoc.readyState + '), waiting...');
              setTimeout(processIframe, 500);
              return;
            }

            console.log('Iframe ready, readyState:', iframeDoc.readyState);

            // Helper to wait for element in iframe
            function waitForElement(doc, selector, timeout = 10000) {
              return new Promise((resolve, reject) => {
                const element = doc.querySelector(selector);
                if (element) {
                  resolve(element);
                  return;
                }

                const observer = new MutationObserver(() => {
                  const element = doc.querySelector(selector);
                  if (element) {
                    observer.disconnect();
                    resolve(element);
                  }
                });

                observer.observe(doc.body, {
                  childList: true,
                  subtree: true
                });

                setTimeout(() => {
                  observer.disconnect();
                  reject(new Error(`Timeout waiting for ${selector}`));
                }, timeout);
              });
            }

            // Log diagnostics
            function logDiagnostics() {
              console.log('=== IFRAME DIAGNOSTICS ===');
              console.log('Iframe document URL:', iframeDoc.location.href);
              console.log('Document readyState:', iframeDoc.readyState);
              console.log('Form exists:', !!iframeDoc.querySelector('form'));

              const inputs = Array.from(iframeDoc.querySelectorAll('input[id]'));
              console.log('Input fields with IDs:', inputs.slice(0, 10).map(i => ({ id: i.id, type: i.type })));

              const timeRelated = Array.from(iframeDoc.querySelectorAll('[id*="time"], [id*="work"]'));
              console.log('Time/work related fields:', timeRelated.slice(0, 10).map(e => ({ id: e.id, tag: e.tagName })));
            }

            logDiagnostics();

            // Try to find and fill fields
            async function attemptFill() {
              try {
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

                console.log('Waiting for fields in iframe...');

                // Look for time_worked field - try multiple selectors
                let timeContainer = iframeDoc.querySelector('[id*="time_worked"]');
                if (!timeContainer) {
                  console.log('time_worked not immediately found, waiting...');
                  timeContainer = await waitForElement(iframeDoc, 'input[id*="time_worked"], div[id*="time_worked"]');
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
                const hiddenTime = iframeDoc.querySelector('[id$="time_worked"]') ||
                                  iframeDoc.querySelector('input[name*="time_worked"]');
                if (!hiddenTime) throw new Error('Hidden time field not found');
                console.log('Found hidden time:', hiddenTime.id);

                // Find work start/end input fields (the actual datetime inputs)
                let startField = iframeDoc.querySelector('input[id="incident.u_work_start"]') ||
                                iframeDoc.querySelector('input[name="incident.u_work_start"]');

                if (!startField) {
                  console.log('Waiting for work_start input field...');
                  startField = await waitForElement(iframeDoc, 'input[id="incident.u_work_start"]');
                }
                console.log('Found work_start input:', startField?.id, 'current value:', startField?.value);

                let endField = iframeDoc.querySelector('input[id="incident.u_work_end"]') ||
                              iframeDoc.querySelector('input[name="incident.u_work_end"]');

                if (!endField) {
                  console.log('Waiting for work_end input field...');
                  endField = await waitForElement(iframeDoc, 'input[id="incident.u_work_end"]');
                }
                console.log('Found work_end input:', endField?.id, 'current value:', endField?.value);

                const workNotesField = iframeDoc.querySelector('[id*="work_notes"]') ||
                                      await waitForElement(iframeDoc, '[id*="work_notes"]');
                console.log('Found work_notes:', workNotesField.id);

                // Find work type dropdown (optional - may not exist in all forms)
                let workTypeField = null;
                try {
                  workTypeField = iframeDoc.querySelector('select[id="incident.u_work_type"]') ||
                                 iframeDoc.querySelector('input[id="incident.u_work_type"]');
                  if (workTypeField) {
                    console.log('Found work_type:', workTypeField.id, 'tag:', workTypeField.tagName);
                  } else {
                    console.log('Work type field not found (may not exist in this form)');
                  }
                } catch (e) {
                  console.log('Work type field not found:', e.message);
                }

                // Fill time worked
                const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
                const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
                const secs = '00';

                hourInput.value = hours;
                minInput.value = mins;
                secInput.value = secs;
                hiddenTime.value = `${hours}:${mins}:${secs}`;

                // Fill start/end using current date
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

                // Set work start/end times
                const formattedStart = formatDate(startTime);
                const formattedEnd = formatDate(endTime);

                startField.value = formattedStart;
                endField.value = formattedEnd;
                workNotesField.value = 'updating time';

                console.log('Set work_start to:', formattedStart);
                console.log('Set work_end to:', formattedEnd);

                // Set work type if field exists
                if (workTypeField) {
                  // Try to find the option with "Technical Troubleshooting" text
                  if (workTypeField.tagName === 'SELECT') {
                    // First try the exact value
                    const targetValue = 'technical_troubleshooting_diagnostics';
                    const options = Array.from(workTypeField.options);
                    const targetOption = options.find(opt => opt.value === targetValue);

                    if (targetOption) {
                      workTypeField.value = targetValue;
                      console.log('Set work_type to:', targetOption.text, 'value:', targetValue);
                    } else {
                      // If exact value not found, search by text
                      const textOption = options.find(opt =>
                        opt.text.includes('Technical Troubleshooting') ||
                        opt.text.includes('Diagnostics')
                      );
                      if (textOption) {
                        workTypeField.value = textOption.value;
                        console.log('Set work_type to:', textOption.text);
                      } else {
                        console.log('Could not find "Technical Troubleshooting & Diagnostics" option. Available options:',
                          options.map(opt => ({ text: opt.text, value: opt.value })));
                      }
                    }
                  } else {
                    // If it's an input field (reference field), set the display value
                    workTypeField.value = 'Technical Troubleshooting & Diagnostics';
                    console.log('Set work_type value to: Technical Troubleshooting & Diagnostics');
                  }
                }

                // Dispatch events on all fields
                const fieldsToUpdate = [hourInput, minInput, secInput, hiddenTime, startField, endField, workNotesField];

                if (workTypeField) {
                  fieldsToUpdate.push(workTypeField);
                }

                fieldsToUpdate.forEach(field => {
                  field.dispatchEvent(new Event('input', { bubbles: true }));
                  field.dispatchEvent(new Event('change', { bubbles: true }));
                  field.dispatchEvent(new Event('blur', { bubbles: true }));
                });

                console.log('✓ Time filled successfully!');
                resolve({ success: true });
              } catch (error) {
                console.error('✗ Error filling time:', error);
                logDiagnostics();
                resolve({ success: false, error: error.message });
              }
            }

            attemptFill();
          } catch (error) {
            console.error('Error accessing iframe:', error);
            resolve({ success: false, error: 'Cannot access iframe: ' + error.message });
          }
        }

        // Start processing - wait for load event or try immediately
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          console.log('Iframe already loaded, processing immediately');
          processIframe();
        } else {
          console.log('Waiting for iframe load event');
          iframe.addEventListener('load', processIframe);
          // Also try after a delay in case load event already fired
          setTimeout(processIframe, 1000);
        }
      })
      .catch(error => {
        console.error('Error finding iframe:', error);
        resolve({ success: false, error: error.message });
      });
  });
}
