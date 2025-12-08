/**
 * Save button finding utilities
 */

async function findSaveButton() {
  let saveButton = document.querySelector('#sysverb_update_and_stay');
  if (saveButton) return saveButton;

  for (const iframe of document.querySelectorAll('iframe')) {
    try {
      saveButton = (iframe.contentDocument || iframe.contentWindow.document)?.querySelector('#sysverb_update_and_stay');
      if (saveButton) return saveButton;
    } catch (e) {
      console.debug('Cannot access iframe content (cross-origin):', e.message);
    }
  }

  if (window.IframeFinder) {
    try {
      const iframe = await window.IframeFinder.findIframeInDOM();
      if (iframe) {
        const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
        saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
        if (saveButton) return saveButton;
      }
    } catch (e) {
      console.debug('IframeFinder failed to find save button:', e.message);
    }
  }

  return null;
}

// Make available globally
window.findSaveButton = findSaveButton;

