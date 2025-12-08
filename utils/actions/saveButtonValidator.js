/**
 * Save button validation utilities
 */

function isButtonClickable(button) {
  const isDisabled = button.disabled || button.hasAttribute('disabled') ||
                     button.classList.contains('disabled') ||
                     button.getAttribute('aria-disabled') === 'true';
  const isVisible = button.offsetParent !== null && 
                   button.style.display !== 'none' &&
                   button.style.visibility !== 'hidden';
  return { clickable: !isDisabled && isVisible, isDisabled, isVisible };
}

function verifySaveTriggered(button, wasDisabledBefore) {
  const isDisabledAfter = button.disabled || button.hasAttribute('disabled') ||
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

// Make available globally
window.isButtonClickable = isButtonClickable;
window.verifySaveTriggered = verifySaveTriggered;

