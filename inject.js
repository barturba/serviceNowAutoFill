/**
 * Injected script that runs in page context
 * This script uses the injected utility modules to fill ServiceNow forms
 * 
 * Note: This file expects the utility modules to be injected first via popup.js
 */

/**
 * Main function injected into page context to fill time entry form
 * @param {string} timeValue - Time duration string (e.g., "15 minutes")
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function fillTimeInNestedFrame(timeValue) {
  console.log('Starting fillTimeInNestedFrame...');
  console.log('Current URL:', window.location.href);

  // Check that required functions are available (from injected modules)
  if (!window.FormFiller || !window.FormFiller.processIncidentForm) {
    throw new Error('FormFiller.processIncidentForm not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.findIframeInDOM) {
    throw new Error('IframeFinder.findIframeInDOM not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.waitForIframeLoad) {
    throw new Error('IframeFinder.waitForIframeLoad not found. Make sure utils modules are injected.');
  }

  // First, check if we're already in the incident form (no iframe needed)
  const directTimeField = document.querySelector('[id*="time_worked"]');
  const directWorkStart = document.querySelector('[id*="work_start"]');
  if (directTimeField || directWorkStart) {
    console.log('✓ Found incident form fields directly in current document (no iframe needed)');
    return await window.FormFiller.processIncidentForm(document, timeValue);
  }

  console.log('Fields not in current document, searching for iframe...');

  try {
    const iframe = await window.IframeFinder.findIframeInDOM();
    console.log('✓ Found iframe:', iframe);

    const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
    return await window.FormFiller.processIncidentForm(iframeDoc, timeValue);
  } catch (error) {
    console.error('Error finding or accessing iframe:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Function to process alert cleared workflow
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function processAlertCleared() {
  console.log('Starting processAlertCleared...');
  console.log('Current URL:', window.location.href);

  // Check that required functions are available
  if (!window.FormFiller || !window.FormFiller.processAlertCleared) {
    throw new Error('FormFiller.processAlertCleared not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.findIframeInDOM) {
    throw new Error('IframeFinder.findIframeInDOM not found. Make sure utils modules are injected.');
  }
  if (!window.IframeFinder || !window.IframeFinder.waitForIframeLoad) {
    throw new Error('IframeFinder.waitForIframeLoad not found. Make sure utils modules are injected.');
  }

  // First, check if we're already in the incident form (no iframe needed)
  const directTimeField = document.querySelector('[id*="time_worked"]');
  const directWorkStart = document.querySelector('[id*="work_start"]');
  if (directTimeField || directWorkStart) {
    console.log('✓ Found incident form fields directly in current document (no iframe needed)');
    return await window.FormFiller.processAlertCleared(document);
  }

  console.log('Fields not in current document, searching for iframe...');

  try {
    const iframe = await window.IframeFinder.findIframeInDOM();
    console.log('✓ Found iframe:', iframe);

    const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
    return await window.FormFiller.processAlertCleared(iframeDoc);
  } catch (error) {
    console.error('Error finding or accessing iframe:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main function injected into page context to fill time entry form and then click Save
 * @param {string} timeValue - Time duration string (e.g., "15 minutes")
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function fillTimeInNestedFrameAndSave(timeValue) {
  console.log('Starting fillTimeInNestedFrameAndSave...');
  console.log('Current URL:', window.location.href);

  // First, fill the time entry form using the existing function
  const fillResult = await fillTimeInNestedFrame(timeValue);
  
  if (!fillResult.success) {
    console.error('Failed to fill time entry:', fillResult.error);
    return fillResult;
  }

  console.log('✓ Time entry filled successfully, now clicking Save button...');

  // Wait a moment for form fields to be fully updated
  await new Promise(resolve => setTimeout(resolve, 200));

  // Find and click the Save button
  // The Save button has id="sysverb_update_and_stay" and onclick="return gsftSubmit(this);"
  let saveButton = null;
  
  // Try to find the Save button in the current document
  saveButton = document.querySelector('#sysverb_update_and_stay');
  
  // If not found, try searching in iframes
  if (!saveButton) {
    console.log('Save button not found in main document, searching in iframes...');
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
        if (saveButton) {
          console.log('✓ Found Save button in iframe');
          break;
        }
      } catch (e) {
        // Cross-origin iframe, skip
        console.log('Cannot access iframe:', e.message);
      }
    }
  }

  // Also try using the IframeFinder utility if available
  if (!saveButton && window.IframeFinder) {
    try {
      const iframe = await window.IframeFinder.findIframeInDOM();
      if (iframe) {
        const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
        saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
        if (saveButton) {
          console.log('✓ Found Save button using IframeFinder');
        }
      }
    } catch (e) {
      console.log('Error finding iframe for Save button:', e.message);
    }
  }

  if (saveButton) {
    console.log('Clicking Save button...');
    try {
      // Click the button - ServiceNow's onclick handler will call gsftSubmit(this)
      saveButton.click();
      console.log('✓ Save button clicked successfully');
      
      // Wait a moment to ensure the click was processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('Error clicking Save button:', error);
      return { success: false, error: 'Failed to click Save button: ' + error.message };
    }
  } else {
    console.warn('⚠ Save button (#sysverb_update_and_stay) not found');
    return { success: false, error: 'Save button not found on page' };
  }
}

// Make functions available globally for chrome.scripting.executeScript
window.fillTimeInNestedFrame = fillTimeInNestedFrame;
window.processAlertCleared = processAlertCleared;
window.fillTimeInNestedFrameAndSave = fillTimeInNestedFrameAndSave;

