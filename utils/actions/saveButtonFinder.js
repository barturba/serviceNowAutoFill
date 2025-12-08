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
    } catch (e) {}
  }

  if (window.IframeFinder) {
    try {
      const iframe = await window.IframeFinder.findIframeInDOM();
      if (iframe) {
        const iframeDoc = await window.IframeFinder.waitForIframeLoad(iframe);
        saveButton = iframeDoc.querySelector('#sysverb_update_and_stay');
        if (saveButton) return saveButton;
      }
    } catch (e) {}
  }

  return null;
}

// Make available globally
window.findSaveButton = findSaveButton;

