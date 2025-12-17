/**
 * Find assigned_to field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The assigned_to field or null
 */
window.FieldFinder.findAssignedToField = window.FieldFinder.createFieldFinder('assigned_to', [
  'input[id$=".assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
  'input[id^="incident.assigned_to"]:not([type="hidden"])',
  'input[id$="assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
  'input[name$=".assigned_to"]:not([type="hidden"])',
  'input[id*="assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
  'select[id$=".assigned_to"]:not([type="hidden"])',
  'select[id*="assigned_to"]:not([type="hidden"])'
]);

