/**
 * Find close_notes/resolution_notes field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The close_notes field or null
 */
window.FieldFinder.findCloseNotesField = window.FieldFinder.createFieldFinder('close_notes', [
  'textarea[id$=".close_notes"]',
  'textarea[id$="close_notes"]',
  'textarea[name$=".close_notes"]',
  'textarea[id*="close_notes"]',
  'textarea[id$=".resolution_notes"]',
  'textarea[id*="resolution_notes"]',
  'input[id*="close_notes"]',
  'input[id*="resolution_notes"]'
]);

