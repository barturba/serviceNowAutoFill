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

// Function that runs in the page context to access the nested iframe
function fillTimeInNestedFrame(timeValue) {
  return new Promise((resolve) => {
    console.log('Starting fillTimeInNestedFrame...');

    // Helper to wait for iframe element to appear
    function waitForIframe(timeout = 15000) {
      return new Promise((resolve, reject) => {
        // Try to find it immediately
        let iframe = document.getElementById('gsft_main') ||
                     document.querySelector('iframe[name="gsft_main"]') ||
                     document.querySelector('iframe[title*="Main Content"]');

        if (iframe) {
          console.log('Iframe found immediately');
          resolve(iframe);
          return;
        }

        console.log('Iframe not found, waiting for it to appear...');

        // Watch for it to appear
        const observer = new MutationObserver(() => {
          iframe = document.getElementById('gsft_main') ||
                   document.querySelector('iframe[name="gsft_main"]') ||
                   document.querySelector('iframe[title*="Main Content"]');

          if (iframe) {
            console.log('Iframe appeared in DOM');
            observer.disconnect();
            resolve(iframe);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error('Timeout waiting for iframe to appear'));
        }, timeout);
      });
    }

    // Wait for iframe to exist, then process it
    waitForIframe()
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

                // Find work start/end fields
                const startField = iframeDoc.querySelector('[id*="work_start"]') ||
                                  await waitForElement(iframeDoc, '[id*="work_start"]');
                console.log('Found work_start:', startField.id);

                const endField = iframeDoc.querySelector('[id*="work_end"]') ||
                                await waitForElement(iframeDoc, '[id*="work_end"]');
                console.log('Found work_end:', endField.id);

                const workNotesField = iframeDoc.querySelector('[id*="work_notes"]') ||
                                      await waitForElement(iframeDoc, '[id*="work_notes"]');
                console.log('Found work_notes:', workNotesField.id);

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
                  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
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
