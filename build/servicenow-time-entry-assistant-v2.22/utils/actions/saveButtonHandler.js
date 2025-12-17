/**
 * Save button clicking utilities
 */

async function clickSaveButton() {
  await window.delay(window.TimingConstants.DELAY_BUTTON_CLICK);
  const saveButton = await window.findSaveButton();
  if (!saveButton) {
    console.warn('⚠ Save button (#sysverb_update_and_stay) not found');
    return { success: false, error: 'Save button not found on page' };
  }

  const { isDisabled, isVisible } = window.isButtonClickable(saveButton);
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
    
    // Wait a bit longer to allow the page to react to the click
    await window.delay(window.TimingConstants.DELAY_SAVE_VERIFY);
    
    if (window.verifySaveTriggered(saveButton, wasDisabledBefore)) {
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

