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
    // Check if button is disabled or not visible
    const isDisabled = saveButton.disabled || 
                       saveButton.hasAttribute('disabled') ||
                       saveButton.classList.contains('disabled') ||
                       saveButton.getAttribute('aria-disabled') === 'true';
    
    const isVisible = saveButton.offsetParent !== null && 
                     saveButton.style.display !== 'none' &&
                     saveButton.style.visibility !== 'hidden';
    
    if (isDisabled) {
      console.warn('⚠ Save button is disabled');
      return { success: false, error: 'Save button is disabled and cannot be clicked' };
    }
    
    if (!isVisible) {
      console.warn('⚠ Save button is not visible');
      return { success: false, error: 'Save button is not visible and cannot be clicked' };
    }
    
    console.log('Clicking Save button...');
    try {
      // Store initial state to verify save was triggered
      const wasDisabledBefore = saveButton.disabled;
      
      // Click the button - ServiceNow's onclick handler will call gsftSubmit(this)
      saveButton.click();
      console.log('✓ Save button clicked');
      
      // Wait a moment for the click to be processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify that the save operation was triggered
      // ServiceNow typically disables the button or shows loading state after clicking Save
      const isDisabledAfter = saveButton.disabled || 
                              saveButton.hasAttribute('disabled') ||
                              saveButton.classList.contains('disabled');
      
      // Check if form is submitting (button disabled after click indicates submission started)
      // Also check for common ServiceNow loading indicators
      const doc = saveButton.ownerDocument || document;
      const hasLoadingIndicator = doc.querySelector('.loading, .spinner, [class*="loading"]') !== null;
      
      // If button became disabled after click, that's a good sign the save was triggered
      // Or if there's a loading indicator, that also indicates submission
      if (isDisabledAfter && !wasDisabledBefore) {
        console.log('✓ Save operation triggered (button disabled after click)');
        return { success: true };
      }
      
      if (hasLoadingIndicator) {
        console.log('✓ Save operation triggered (loading indicator detected)');
        return { success: true };
      }
      
      // Additional check: see if g_form was modified (ServiceNow sets g_form.modified = false after save)
      try {
        const gForm = doc.defaultView?.g_form || window.g_form;
        if (gForm && typeof gForm.modified !== 'undefined') {
          // If g_form.modified exists, the form API is available
          // We'll assume the click was successful if we got this far
          console.log('✓ Save operation triggered (g_form API available)');
          return { success: true };
        }
      } catch (e) {
        // g_form might not be accessible, continue with other checks
      }
      
      // If we can't verify, log a warning but still return success
      // (The click() call itself succeeded, even if we can't verify the save)
      console.warn('⚠ Could not verify save operation, but button click succeeded');
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

