/**
 * Find assigned_to field in document
 * @param {Document} doc - Document to search
 * @returns {Promise<HTMLElement|null>} The assigned_to field or null
 */
window.FieldFinder.findAssignedToField = async function(doc) {
  // ServiceNow reference fields: look for visible input fields, exclude hidden sys_original fields
  // Priority: fields without sys_original prefix, visible (not hidden), and specific ID patterns
  let assignedToField = window.FieldFinder.querySelectorFirst(doc, [
    'input[id$=".assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
    'input[id^="incident.assigned_to"]:not([type="hidden"])',
    'input[id$="assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
    'input[name$=".assigned_to"]:not([type="hidden"])',
    'input[id*="assigned_to"]:not([type="hidden"]):not([id*="sys_original"])',
    'select[id$=".assigned_to"]:not([type="hidden"])',
    'select[id*="assigned_to"]:not([type="hidden"])'
  ]);
  
  if (!assignedToField) {
    console.log('Waiting for assigned_to field...');
    try {
      assignedToField = await window.FieldFinder.waitForElement(doc, 
        'input[id$=".assigned_to"]:not([type="hidden"]):not([id*="sys_original"]), ' +
        'input[id^="incident.assigned_to"]:not([type="hidden"]), ' +
        'input[id$="assigned_to"]:not([type="hidden"]):not([id*="sys_original"]), ' +
        'input[id*="assigned_to"]:not([type="hidden"]):not([id*="sys_original"]), ' +
        'select[id*="assigned_to"]:not([type="hidden"])'
      );
    } catch (e) {
      console.log('Could not find assigned_to field:', e.message);
    }
  }
  console.log('Found assigned_to:', assignedToField?.id, 'tag:', assignedToField?.tagName, 'type:', assignedToField?.type);
  return assignedToField;
};

