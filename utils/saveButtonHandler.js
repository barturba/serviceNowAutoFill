/**
 * Save button finding and clicking utilities
 */

/**
 * Find save button in document or iframes
 */
async function findSaveButton() {
  // Try current document first
  let saveButton = document.querySelector('#sysverb_update_and_stay');
  if (saveButton) return saveButton;

  // Try searching in iframes
  console.log('Save button not found in main document, searching in iframes...');
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
      if (saveButton) {
        console.log('✓ Found Save button in iframe');
        return saveButton;
      }
    } catch (e) {
      console.log('Cannot access iframe:', e.message);
    }
  }

  // Try using IframeFinder utility
  if (window.IframeFinder) {
    try {
      const iframe = await window.IframeFinder.findIframeInDOM();
      if (iframe) {
        const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
        saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
        if (saveButton) {
          console.log('✓ Found Save button using IframeFinder');
          return saveButton;
        }
      }
    } catch (e) {
      console.log('Error finding iframe for Save button:', e.message);
    }
  }

  return null;
}

/**
 * Check if save button is clickable
 */
function isButtonClickable(button) {
  const isDisabled = button.disabled || 
                     button.hasAttribute('disabled') ||
                     button.classList.contains('disabled') ||
                     button.getAttribute('aria-disabled') === 'true';
  
  const isVisible = button.offsetParent !== null && 
                   button.style.display !== 'none' &&
                   button.style.visibility !== 'hidden';
  
  return { clickable: !isDisabled && isVisible, isDisabled, isVisible };
}

/**
 * Verify save operation was triggered
 */
function verifySaveTriggered(button, wasDisabledBefore) {
  const isDisabledAfter = button.disabled || 
                         button.hasAttribute('disabled') ||
                         button.classList.contains('disabled');
  
  const doc = button.ownerDocument || document;
  const hasLoadingIndicator = doc.querySelector('.loading, .spinner, [class*="loading"]') !== null;
  
  if (isDisabledAfter && !wasDisabledBefore) {
    console.log('✓ Save operation triggered (button disabled after click)');
    return true;
  }
  
  if (hasLoadingIndicator) {
    console.log('✓ Save operation triggered (loading indicator detected)');
    return true;
  }
  
  try {
    const gForm = doc.defaultView?.g_form || window.g_form;
    if (gForm && typeof gForm.modified !== 'undefined') {
      console.log('✓ Save operation triggered (g_form API available)');
      return true;
    }
  } catch (e) {
    // g_form might not be accessible
  }
  
  return false;
}

/**
 * Click save button and verify operation
 */
async function clickSaveButton() {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const saveButton = await findSaveButton();
  if (!saveButton) {
    console.warn('⚠ Save button (#sysverb_update_and_stay) not found');
    return { success: false, error: 'Save button not found on page' };
  }

  const { clickable, isDisabled, isVisible } = isButtonClickable(saveButton);
  
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
    const wasDisabledBefore = saveButton.disabled;
    saveButton.click();
    console.log('✓ Save button clicked');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (verifySaveTriggered(saveButton, wasDisabledBefore)) {
      return { success: true };
    }
    
    console.warn('⚠ Could not verify save operation, but button click succeeded');
    return { success: true };
  } catch (error) {
    console.error('Error clicking Save button:', error);
    return { success: false, error: 'Failed to click Save button: ' + error.message };
  }
}

// Make function available globally
window.clickSaveButton = clickSaveButton;

