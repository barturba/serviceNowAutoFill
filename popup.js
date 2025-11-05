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
async function fillTimeInNestedFrame(timeValue) {
  console.log('Starting fillTimeInNestedFrame...');
  console.log('Current URL:', window.location.href);

  // Helper to wait for element
  function waitForElement(doc, selector, timeout = 10000) {
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

  // Helper function to process incident form in any document context
  async function processIncidentForm(doc) {
    console.log('=== PROCESSING INCIDENT FORM ===');
    console.log('Document URL:', doc.location.href);
    console.log('Document readyState:', doc.readyState);

    try {
      const durationSeconds = parseDuration(timeValue);
      if (durationSeconds <= 0) {
        throw new Error('Invalid time value: ' + timeValue);
      }

      // Look for time_worked field
      let timeContainer = doc.querySelector('[id*="time_worked"]');
      if (!timeContainer) {
        console.log('time_worked not immediately found, waiting...');
        timeContainer = await waitForElement(doc, 'input[id*="time_worked"], div[id*="time_worked"]');
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

      // Debug: log all elements with work_start/work_end/work_notes/work_type in ID
      const allWorkStartElements = doc.querySelectorAll('[id*="work_start"]');
      const allWorkEndElements = doc.querySelectorAll('[id*="work_end"]');
      const allWorkNotesElements = doc.querySelectorAll('[id*="work_notes"]');
      const allWorkTypeElements = doc.querySelectorAll('[id*="work_type"]');
      console.log('All work_start elements:', Array.from(allWorkStartElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));
      console.log('All work_end elements:', Array.from(allWorkEndElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));
      console.log('All work_notes elements:', Array.from(allWorkNotesElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));
      console.log('All work_type elements:', Array.from(allWorkTypeElements).map(e => ({ id: e.id, tag: e.tagName, type: e.type })));

      // Try multiple selectors in order of specificity for start field (works for incident, sc_task, etc.)
      let startField = doc.querySelector('input[id$=".u_work_start"]') ||
                      doc.querySelector('input[id$="u_work_start"]') ||
                      doc.querySelector('input[name$=".u_work_start"]') ||
                      doc.querySelector('input[id*="work_start"]');
      if (!startField) {
        console.log('Waiting for work_start field...');
        try {
          startField = await waitForElement(doc, 'input[id$=".u_work_start"], input[id$="u_work_start"], input[id*="work_start"]');
        } catch (e) {
          console.log('Could not find work_start input field:', e.message);
        }
      }
      console.log('Found work_start:', startField?.id, 'tag:', startField?.tagName, 'type:', startField?.type);

      // Try multiple selectors for end field (works for incident, sc_task, etc.)
      let endField = doc.querySelector('input[id$=".u_work_end"]') ||
                    doc.querySelector('input[id$="u_work_end"]') ||
                    doc.querySelector('input[name$=".u_work_end"]') ||
                    doc.querySelector('input[id*="work_end"]');
      if (!endField) {
        console.log('Waiting for work_end field...');
        try {
          endField = await waitForElement(doc, 'input[id$=".u_work_end"], input[id$="u_work_end"], input[id*="work_end"]');
        } catch (e) {
          console.log('Could not find work_end input field:', e.message);
        }
      }
      console.log('Found work_end:', endField?.id, 'tag:', endField?.tagName, 'type:', endField?.type);

      // Work notes - try to find the Angular activity stream textarea FIRST (works for all tables)
      let workNotesField = doc.querySelector('textarea#activity-stream-textarea') ||
                          doc.querySelector('textarea[data-stream-text-input="work_notes"]') ||
                          doc.querySelector('textarea[ng-model*="inputTypeValue"]') ||
                          doc.querySelector('textarea[id*="activity-stream"][id*="work_notes"]') ||
                          doc.querySelector('textarea[id$=".work_notes"]') ||
                          doc.querySelector('textarea[id$="work_notes"]') ||
                          doc.querySelector('textarea[name$=".work_notes"]') ||
                          doc.querySelector('input[id$=".work_notes"]') ||
                          doc.querySelector('textarea[id*="work_notes"]') ||
                          doc.querySelector('input[id*="work_notes"]');
      if (!workNotesField) {
        console.log('Waiting for work_notes field...');
        try {
          workNotesField = await waitForElement(doc, 'textarea#activity-stream-textarea, textarea[data-stream-text-input="work_notes"], textarea[id$=".work_notes"], textarea[id*="work_notes"], input[id*="work_notes"]');
        } catch (e) {
          console.log('Could not find work_notes field:', e.message);
        }
      }
      console.log('Found work_notes:', workNotesField?.id, 'tag:', workNotesField?.tagName, 'has ng-model:', workNotesField?.getAttribute('ng-model'));

      // Also look for contenteditable rich text editor for work_notes
      let workNotesEditable = doc.querySelector('[id*="work_notes"][contenteditable="true"]') ||
                              doc.querySelector('[contenteditable="true"][id*="work_notes"]');
      if (workNotesEditable) {
        console.log('Found work_notes contenteditable element:', workNotesEditable.id || workNotesEditable.className);
      }

      // Work type - try to find select dropdown or input (works for all tables)
      let workTypeField = doc.querySelector('select[id$=".u_work_type"]') ||
                         doc.querySelector('select[id$="u_work_type"]') ||
                         doc.querySelector('select[name$=".u_work_type"]') ||
                         doc.querySelector('select[id*="work_type"]') ||
                         doc.querySelector('input[id$=".u_work_type"]') ||
                         doc.querySelector('input[id$="u_work_type"]') ||
                         doc.querySelector('input[id*="work_type"]');
      if (!workTypeField) {
        console.log('Waiting for work_type field...');
        try {
          workTypeField = await waitForElement(doc, 'select[id$=".u_work_type"], select[id$="u_work_type"], select[id*="work_type"], input[id*="work_type"]');
        } catch (e) {
          console.log('Could not find work_type field:', e.message);
        }
      }
      console.log('Found work_type:', workTypeField?.id, 'tag:', workTypeField?.tagName, 'type:', workTypeField?.type);

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
      // Try ServiceNow's GlideForm API first
      const workNotesText = 'updating time';
      let workNotesSetViaAPI = false;

      // Check if g_form (ServiceNow's form API) is available
      if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
        console.log('Found ServiceNow g_form API, using it to set work_notes');
        try {
          // Try to set using GlideForm API
          doc.defaultView.g_form.setValue('work_notes', workNotesText);
          console.log('✓ Set work_notes using g_form.setValue()');
          workNotesSetViaAPI = true;
        } catch (e) {
          console.log('g_form.setValue failed:', e.message);
        }
      } else {
        console.log('g_form API not available, will use direct field manipulation');
      }

      if (workNotesField) {
        console.log('Attempting to populate work_notes field...');
        console.log('Field ID:', workNotesField.id);
        console.log('Field ng-model:', workNotesField.getAttribute('ng-model'));

        // Method 1: Try AngularJS scope manipulation (ServiceNow uses Angular)
        try {
          // Try to find Angular in multiple contexts
          let angular = doc.defaultView.angular || window.angular || doc.defaultView.parent?.angular;

          if (angular) {
            console.log('Found AngularJS, attempting to set via scope...');
            const ngElement = angular.element(workNotesField);
            const scope = ngElement.scope();

            if (scope) {
              console.log('Found Angular scope');

              // Try different model paths based on the ng-model attribute
              const ngModel = workNotesField.getAttribute('ng-model');
              console.log('ng-model attribute:', ngModel);

              if (ngModel) {
                // Set the model value
                const modelParts = ngModel.split('.');
                let target = scope;
                for (let i = 0; i < modelParts.length - 1; i++) {
                  target = target[modelParts[i]];
                  if (!target) break;
                }
                if (target) {
                  target[modelParts[modelParts.length - 1]] = workNotesText;
                  console.log('Set Angular model:', ngModel, '=', workNotesText);

                  // Apply the scope changes (use $evalAsync if $apply fails)
                  try {
                    if (scope.$$phase) {
                      // Already in digest cycle, use $evalAsync
                      scope.$evalAsync();
                      console.log('✓ Used $evalAsync (already in digest)');
                    } else {
                      scope.$apply();
                      console.log('✓ Applied Angular scope changes with $apply');
                    }
                    workNotesSetViaAPI = true;
                  } catch (applyError) {
                    console.log('$apply/$evalAsync failed, trying direct update:', applyError.message);
                    // Force a digest
                    try {
                      scope.$digest();
                      console.log('✓ Used $digest instead');
                      workNotesSetViaAPI = true;
                    } catch (digestError) {
                      console.log('$digest also failed:', digestError.message);
                    }
                  }
                }
              }
            } else {
              console.log('Could not get Angular scope from element');
            }
          } else {
            console.log('AngularJS not found in iframe window, parent, or main window');
          }
        } catch (e) {
          console.log('Angular scope manipulation failed:', e.message, e.stack);
        }

        // Method 2: Click to activate the field
        workNotesField.click();
        workNotesField.focus();

        // Wait a moment for field to become active
        await new Promise(resolve => setTimeout(resolve, 100));

        // Clear existing content
        workNotesField.value = '';

        // Method 3: Use document.execCommand (simulates typing)
        try {
          workNotesField.select();
          document.execCommand('insertText', false, workNotesText);
          console.log('Used execCommand to insert text');
        } catch (e) {
          console.log('execCommand failed, using direct value setting:', e.message);
        }

        // Method 4: Direct value setting as fallback
        workNotesField.value = workNotesText;
        console.log('Set work_notes textarea value to:', workNotesText);

        // Trigger comprehensive events
        const events = ['click', 'focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
        events.forEach(eventType => {
          const event = new Event(eventType, { bubbles: true, cancelable: true });
          workNotesField.dispatchEvent(event);
        });

        // Also trigger InputEvent specifically
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: workNotesText
        });
        workNotesField.dispatchEvent(inputEvent);

        fieldsToUpdate.push(workNotesField);
      } else {
        console.warn('⚠ work_notes field not found, skipping');
      }

      // Update contenteditable element if found (for visual rich text editor)
      if (workNotesEditable) {
        console.log('Updating contenteditable work_notes element...');
        workNotesEditable.focus();
        workNotesEditable.textContent = workNotesText;
        workNotesEditable.innerHTML = workNotesText;

        // Trigger events on the contenteditable element
        workNotesEditable.dispatchEvent(new Event('focus', { bubbles: true }));
        workNotesEditable.dispatchEvent(new Event('input', { bubbles: true }));
        workNotesEditable.dispatchEvent(new Event('keydown', { bubbles: true }));
        workNotesEditable.dispatchEvent(new Event('keyup', { bubbles: true }));
        workNotesEditable.dispatchEvent(new Event('change', { bubbles: true }));
        workNotesEditable.dispatchEvent(new Event('blur', { bubbles: true }));
        console.log('Set work_notes contenteditable to:', workNotesText);
      } else {
        // If no direct contenteditable found, check parent wrapper
        if (workNotesField) {
          const parentEditor = workNotesField.closest('[id*="work_notes"]');
          if (parentEditor && parentEditor !== workNotesField) {
            console.log('Found work_notes parent wrapper:', parentEditor.id);
            const editableContent = parentEditor.querySelector('[contenteditable="true"]');
            if (editableContent) {
              console.log('Found contenteditable element in wrapper, updating it too');
              editableContent.focus();
              editableContent.textContent = workNotesText;
              editableContent.innerHTML = workNotesText;
              editableContent.dispatchEvent(new Event('focus', { bubbles: true }));
              editableContent.dispatchEvent(new Event('input', { bubbles: true }));
              editableContent.dispatchEvent(new Event('change', { bubbles: true }));
              editableContent.dispatchEvent(new Event('blur', { bubbles: true }));
            }
          }
        }
      }
      if (workTypeField) {
        // For select dropdown, try to set to "Technical Troubleshooting & Diagnosis"
        if (workTypeField.tagName === 'SELECT') {
          const options = Array.from(workTypeField.options);
          console.log('Available work_type options:', options.map(o => ({ value: o.value, text: o.text })));

          // Try to select "Technical Troubleshooting & Diagnosis" first, then fall back to other options
          let selectedOption = options.find(o => o.text.toLowerCase().includes('technical troubleshooting')) ||
                              options.find(o => o.text.toLowerCase().includes('troubleshooting')) ||
                              options.find(o => o.text.toLowerCase().includes('diagnosis')) ||
                              options.find(o => o.text.toLowerCase().includes('planned')) ||
                              options.find(o => o.text.toLowerCase().includes('work')) ||
                              options.find(o => o.value && o.value !== '');

          if (selectedOption) {
            // Try using g_form API first
            if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
              try {
                doc.defaultView.g_form.setValue('u_work_type', selectedOption.value);
                console.log('✓ Set work_type using g_form.setValue() to:', selectedOption.text);
              } catch (e) {
                console.log('g_form.setValue for work_type failed, using direct value:', e.message);
                workTypeField.value = selectedOption.value;
              }
            } else {
              workTypeField.value = selectedOption.value;
            }
            console.log('Set work_type to:', selectedOption.text, '(value:', selectedOption.value + ')');
          } else {
            console.warn('⚠ No suitable work_type option found');
          }
        } else {
          // If it's an input field, set it to "Technical Troubleshooting & Diagnosis"
          workTypeField.value = 'Technical Troubleshooting & Diagnosis';
          console.log('Set work_type to: Technical Troubleshooting & Diagnosis');
        }
        fieldsToUpdate.push(workTypeField);
      } else {
        console.warn('⚠ work_type field not found, skipping');
      }

      // Dispatch events on all fields that were successfully found and updated
      console.log('Dispatching events on', fieldsToUpdate.length, 'fields');
      fieldsToUpdate.forEach(field => {
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('blur', { bubbles: true }));
      });

      console.log('✓ Time filled successfully!');
      return { success: true };
    } catch (error) {
      console.error('✗ Error filling time:', error);
      return { success: false, error: error.message };
    }
  }

  // First, check if we're already in the incident form (no iframe needed)
  const directTimeField = document.querySelector('[id*="time_worked"]');
  const directWorkStart = document.querySelector('[id*="work_start"]');
  if (directTimeField || directWorkStart) {
    console.log('✓ Found incident form fields directly in current document (no iframe needed)');
    return await processIncidentForm(document);
  }

  console.log('Fields not in current document, searching for iframe...');

  // Helper to find iframe in both regular DOM and shadow DOM
  async function findIframeInDOM(timeout = 15000) {
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
      'iframe' // fallback: any iframe
    ];

    // Helper to check if iframe contains incident form
    function isIncidentFrame(iframe) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return false;
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
      const indent = ' '.repeat(depth);
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

    // Polling loop to search for iframe
    while (Date.now() - startTime < timeout) {
      console.log('=== SEARCHING FOR IFRAME ===');
      // Search regular DOM and shadow DOM
      console.log('Searching regular DOM...');
      const iframe = findInShadowRoots(document);
      if (iframe) {
        console.log('✓ Found iframe!');
        return iframe;
      }

      // Log all iframes on page for debugging
      const allIframes = document.querySelectorAll('iframe');
      console.log('All iframes on page:', allIframes.length);
      allIframes.forEach((frame, idx) => {
        console.log(` Iframe ${idx}:`, {
          id: frame.id,
          name: frame.name,
          src: frame.src?.substring(0, 100),
          title: frame.title,
          className: frame.className
        });
      });

      console.log('Iframe not found yet, retrying in 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.error('✗ TIMEOUT: Could not find iframe after', timeout, 'ms');
    throw new Error('Timeout: iframe not found after searching both regular and shadow DOM');
  }

  try {
    const iframe = await findIframeInDOM();
    console.log('✓ Found iframe:', iframe);

    // Wait for iframe content to load
    const iframeDoc = await new Promise((resolve, reject) => {
      function checkReady() {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (!doc) {
            console.log('Cannot access iframe document yet, waiting...');
            return setTimeout(checkReady, 500);
          }
          if (doc.readyState !== 'complete') {
            console.log('Iframe document not ready (readyState:', doc.readyState + '), waiting...');
            return setTimeout(checkReady, 500);
          }
          console.log('✓ Iframe loaded and ready');
          resolve(doc);
        } catch (error) {
          console.error('Error accessing iframe:', error);
          reject(new Error('Cannot access iframe: ' + error.message));
        }
      }

      // Check immediately
      checkReady();

      // Also listen for load event
      iframe.addEventListener('load', checkReady);
      // Timeout fallback
      setTimeout(checkReady, 1000);
    });

    return await processIncidentForm(iframeDoc);
  } catch (error) {
    console.error('Error finding or accessing iframe:', error);
    return { success: false, error: error.message };
  }
}