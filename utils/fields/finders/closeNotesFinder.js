/**
 * Find close_notes/resolution_notes field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The close_notes field or null
 */
window.FieldFinder.findCloseNotesField = async function(doc) {
  let closeNotesField = doc.querySelector('textarea[id$=".close_notes"]') ||
                       doc.querySelector('textarea[id$="close_notes"]') ||
                       doc.querySelector('textarea[name$=".close_notes"]') ||
                       doc.querySelector('textarea[id*="close_notes"]') ||
                       doc.querySelector('textarea[id$=".resolution_notes"]') ||
                       doc.querySelector('textarea[id*="resolution_notes"]') ||
                       doc.querySelector('input[id*="close_notes"]') ||
                       doc.querySelector('input[id*="resolution_notes"]');
  if (!closeNotesField) {
    console.log('Waiting for close_notes field...');
    try {
      closeNotesField = await window.FieldFinder.waitForElement(doc, 'textarea[id$=".close_notes"], textarea[id$="close_notes"], textarea[id*="close_notes"], textarea[id*="resolution_notes"]');
    } catch (e) {
      console.log('Could not find close_notes field:', e.message);
    }
  }
  console.log('Found close_notes:', closeNotesField?.id, 'tag:', closeNotesField?.tagName, 'type:', closeNotesField?.type);
  return closeNotesField;
};

