/**
 * g_form API helper utilities
 */

/**
 * Get g_form API from document
 * @param {Document} doc - Document containing the form
 * @returns {Object|null} g_form API object or null
 */
function getGForm(doc) {
  return doc.defaultView?.g_form || null;
}

/**
 * Set work notes using g_form API if available
 * @param {Document} doc - Document containing the form
 * @param {string} workNotesText - Text to set
 * @returns {boolean} True if set via API
 */
function setWorkNotesViaGForm(doc, workNotesText) {
  if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
    window.DebugLogger.log('Found ServiceNow g_form API, checking for existing work_notes content');
    try {
      const existingWorkNotes = doc.defaultView.g_form.getValue('work_notes') || '';
      window.DebugLogger.log('Existing work_notes value from g_form:', existingWorkNotes);

      if (!existingWorkNotes) {
        doc.defaultView.g_form.setValue('work_notes', workNotesText);
        window.DebugLogger.log('✓ Set work_notes using g_form.setValue()');
        return true;
      } else {
        window.DebugLogger.log('✓ Preserving existing work_notes content, skipping g_form.setValue()');
        return false;
      }
    } catch (e) {
      window.DebugLogger.log('g_form operations failed:', e.message);
      return false;
    }
  } else {
    window.DebugLogger.log('g_form API not available, will use direct field manipulation');
    return false;
  }
}

// Make available globally
window.getGForm = getGForm;
window.setWorkNotesViaGForm = setWorkNotesViaGForm;

