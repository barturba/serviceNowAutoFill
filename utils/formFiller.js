/**
 * Form filling utilities for ServiceNow incident forms
 */

// Use global namespace for injected scripts
window.FormFiller = window.FormFiller || {};

/**
 * Extract the last work note from the activity stream
 * @param {Document} doc - Document to search
 * @returns {string} Work note text or default
 */
function getLastWorkNote(doc) {
  try {
    // Find all activity stream entries
    const activityEntries = doc.querySelectorAll('.h-card.h-card_md.h-card_comments');
    console.log('Found', activityEntries.length, 'activity entries');

    // Look for the first (most recent) work notes entry
    for (const entry of activityEntries) {
      // Check if this entry is a work notes entry
      const fieldLabel = entry.querySelector('.sn-card-component-time span');
      if (fieldLabel && fieldLabel.textContent.trim() === 'Work notes') {
        // Extract the text content
        const textBody = entry.querySelector('.sn-widget-textblock-body');
        if (textBody) {
          const noteText = textBody.textContent.trim();
          if (noteText) {
            console.log('Found last work note:', noteText);
            return noteText;
          }
        }
      }
    }
    console.log('No work notes found in activity stream, using default');
    return 'updating time';
  } catch (e) {
    console.log('Error extracting work note:', e.message);
    return 'updating time';
  }
}

/**
 * Fill work notes field using various methods
 * @param {Document} doc - Document containing the field
 * @param {HTMLElement} workNotesField - The work notes field element
 * @param {HTMLElement|null} workNotesEditable - Contenteditable element if found
 * @param {string} workNotesText - Text to set
 * @returns {HTMLElement[]} Array of fields that were updated
 */
async function fillWorkNotes(doc, workNotesField, workNotesEditable, workNotesText) {
  const fieldsToUpdate = [];
  let workNotesSetViaAPI = false;

  // Check if g_form (ServiceNow's form API) is available
  if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
    console.log('Found ServiceNow g_form API, checking for existing work_notes content');
    try {
      // Get existing work_notes value
      const existingWorkNotes = doc.defaultView.g_form.getValue('work_notes') || '';
      console.log('Existing work_notes value from g_form:', existingWorkNotes);

      // Only set if there's no existing content
      if (!existingWorkNotes) {
        doc.defaultView.g_form.setValue('work_notes', workNotesText);
        console.log('✓ Set work_notes using g_form.setValue()');
        workNotesSetViaAPI = true;
      } else {
        console.log('✓ Preserving existing work_notes content, skipping g_form.setValue()');
        workNotesSetViaAPI = false;
      }
    } catch (e) {
      console.log('g_form operations failed:', e.message);
    }
  } else {
    console.log('g_form API not available, will use direct field manipulation');
  }

  if (workNotesField) {
    console.log('Attempting to populate work_notes field...');
    console.log('Field ID:', workNotesField.id);
    console.log('Field ng-model:', workNotesField.getAttribute('ng-model'));

    // Preserve existing content
    const existingContent = workNotesField.value || '';
    console.log('Existing work_notes content:', existingContent);

    // Combine existing content with new text
    const finalWorkNotesText = existingContent ? existingContent : workNotesText;
    console.log('Final work_notes text to set:', finalWorkNotesText);

    // Method 1: Try AngularJS scope manipulation (ServiceNow uses Angular)
    try {
      let angular = doc.defaultView.angular || window.angular || doc.defaultView.parent?.angular;

      if (angular) {
        console.log('Found AngularJS, attempting to set via scope...');
        const ngElement = angular.element(workNotesField);
        const scope = ngElement.scope();

        if (scope) {
          console.log('Found Angular scope');
          const ngModel = workNotesField.getAttribute('ng-model');
          console.log('ng-model attribute:', ngModel);

          if (ngModel) {
            const modelParts = ngModel.split('.');
            let target = scope;
            for (let i = 0; i < modelParts.length - 1; i++) {
              target = target[modelParts[i]];
              if (!target) break;
            }
            if (target) {
              target[modelParts[modelParts.length - 1]] = finalWorkNotesText;
              console.log('Set Angular model:', ngModel, '=', finalWorkNotesText);

              try {
                if (scope.$$phase) {
                  scope.$evalAsync();
                  console.log('✓ Used $evalAsync (already in digest)');
                } else {
                  scope.$apply();
                  console.log('✓ Applied Angular scope changes with $apply');
                }
                workNotesSetViaAPI = true;
              } catch (applyError) {
                console.log('$apply/$evalAsync failed, trying direct update:', applyError.message);
                try {
                  scope.$digest();
                  console.log('✓ Used $digest instead');
                  workNotesSetViaAPI = true;
                } catch (digestError) {
                  console.log('$digest also failed:', digestError.message);
                }
              }
            }
          }
        } else {
          console.log('Could not get Angular scope from element');
        }
      } else {
        console.log('AngularJS not found in iframe window, parent, or main window');
      }
    } catch (e) {
      console.log('Angular scope manipulation failed:', e.message, e.stack);
    }

    // Method 2: Click to activate the field
    workNotesField.click();
    workNotesField.focus();

    // Wait a moment for field to become active
    await new Promise(resolve => setTimeout(resolve, 100));

    // Method 3: Use document.execCommand (simulates typing) - only if no existing content
    if (!existingContent) {
      try {
        workNotesField.select();
        document.execCommand('insertText', false, finalWorkNotesText);
        console.log('Used execCommand to insert text');
      } catch (e) {
        console.log('execCommand failed, using direct value setting:', e.message);
      }
    }

    // Method 4: Direct value setting (preserve existing content)
    if (existingContent) {
      workNotesField.value = existingContent;
      console.log('Preserved existing work_notes content:', existingContent);
    } else {
      workNotesField.value = finalWorkNotesText;
      console.log('Set work_notes textarea value to:', finalWorkNotesText);
    }

    // Trigger comprehensive events
    const events = ['click', 'focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'];
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true, cancelable: true });
      workNotesField.dispatchEvent(event);
    });

    // Also trigger InputEvent specifically
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: finalWorkNotesText
    });
    workNotesField.dispatchEvent(inputEvent);

    fieldsToUpdate.push(workNotesField);
  } else {
    console.warn('⚠ work_notes field not found, skipping');
  }

  // Update contenteditable element if found
  if (workNotesEditable) {
    console.log('Checking contenteditable work_notes element...');
    const existingEditableContent = workNotesEditable.textContent || workNotesEditable.innerText || '';
    console.log('Existing contenteditable content:', existingEditableContent);

    if (!existingEditableContent.trim()) {
      workNotesEditable.focus();
      workNotesEditable.textContent = workNotesText;
      workNotesEditable.innerHTML = workNotesText;

      workNotesEditable.dispatchEvent(new Event('focus', { bubbles: true }));
      workNotesEditable.dispatchEvent(new Event('input', { bubbles: true }));
      workNotesEditable.dispatchEvent(new Event('keydown', { bubbles: true }));
      workNotesEditable.dispatchEvent(new Event('keyup', { bubbles: true }));
      workNotesEditable.dispatchEvent(new Event('change', { bubbles: true }));
      workNotesEditable.dispatchEvent(new Event('blur', { bubbles: true }));
      console.log('Set work_notes contenteditable to:', workNotesText);
    } else {
      console.log('✓ Preserving existing contenteditable content');
    }
  } else {
    // If no direct contenteditable found, check parent wrapper
    if (workNotesField) {
      const parentEditor = workNotesField.closest('[id*="work_notes"]');
      if (parentEditor && parentEditor !== workNotesField) {
        console.log('Found work_notes parent wrapper:', parentEditor.id);
        const editableContent = parentEditor.querySelector('[contenteditable="true"]');
        if (editableContent) {
          const existingWrapperContent = editableContent.textContent || editableContent.innerText || '';
          console.log('Existing wrapper contenteditable content:', existingWrapperContent);

          if (!existingWrapperContent.trim()) {
            console.log('Found contenteditable element in wrapper, updating it');
            editableContent.focus();
            editableContent.textContent = workNotesText;
            editableContent.innerHTML = workNotesText;
            editableContent.dispatchEvent(new Event('focus', { bubbles: true }));
            editableContent.dispatchEvent(new Event('input', { bubbles: true }));
            editableContent.dispatchEvent(new Event('change', { bubbles: true }));
            editableContent.dispatchEvent(new Event('blur', { bubbles: true }));
          } else {
            console.log('✓ Preserving existing wrapper contenteditable content');
          }
        }
      }
    }
  }

  return fieldsToUpdate;
}

/**
 * Fill work type field
 * @param {Document} doc - Document containing the field
 * @param {HTMLElement} workTypeField - The work type field element
 * @returns {HTMLElement[]} Array of fields that were updated
 */
function fillWorkType(doc, workTypeField) {
  const fieldsToUpdate = [];

  if (workTypeField) {
    if (workTypeField.tagName === 'SELECT') {
      const options = Array.from(workTypeField.options);
      console.log('Available work_type options:', options.map(o => ({ value: o.value, text: o.text })));

      let selectedOption = options.find(o => o.text.toLowerCase().includes('technical troubleshooting')) ||
                          options.find(o => o.text.toLowerCase().includes('troubleshooting')) ||
                          options.find(o => o.text.toLowerCase().includes('diagnosis')) ||
                          options.find(o => o.text.toLowerCase().includes('planned')) ||
                          options.find(o => o.text.toLowerCase().includes('work')) ||
                          options.find(o => o.value && o.value !== '');

      if (selectedOption) {
        if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
          try {
            doc.defaultView.g_form.setValue('u_work_type', selectedOption.value);
            console.log('✓ Set work_type using g_form.setValue() to:', selectedOption.text);
          } catch (e) {
            console.log('g_form.setValue for work_type failed, using direct value:', e.message);
            workTypeField.value = selectedOption.value;
          }
        } else {
          workTypeField.value = selectedOption.value;
        }
        console.log('Set work_type to:', selectedOption.text, '(value:', selectedOption.value + ')');
      } else {
        console.warn('⚠ No suitable work_type option found');
      }
    } else {
      workTypeField.value = 'Technical Troubleshooting & Diagnosis';
      console.log('Set work_type to: Technical Troubleshooting & Diagnosis');
    }
    fieldsToUpdate.push(workTypeField);
  } else {
    console.warn('⚠ work_type field not found, skipping');
  }

  return fieldsToUpdate;
}

/**
 * Process and fill ServiceNow incident form
 * @param {Document} doc - Document containing the form
 * @param {string} timeValue - Time duration string (e.g., "15 minutes")
 * @returns {Promise<{success: boolean, error?: string}>} Result object
 */
window.FormFiller.processIncidentForm = async function(doc, timeValue) {
  console.log('=== PROCESSING INCIDENT FORM ===');
  console.log('Document URL:', doc.location.href);
  console.log('Document readyState:', doc.readyState);

  try {
    const durationSeconds = window.TimeParser.parseDuration(timeValue);
    if (durationSeconds <= 0) {
      throw new Error('Invalid time value: ' + timeValue);
    }

    // Find all fields
    const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
    const startField = await window.FieldFinder.findWorkStartField(doc);
    const endField = await window.FieldFinder.findWorkEndField(doc);
    const { field: workNotesField, editable: workNotesEditable } = await window.FieldFinder.findWorkNotesField(doc);
    const workTypeField = await window.FieldFinder.findWorkTypeField(doc);

    // Fill time worked
    const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = '00';
    timeFields.hourInput.value = hours;
    timeFields.minInput.value = mins;
    timeFields.secInput.value = secs;
    timeFields.hiddenTime.value = `${hours}:${mins}:${secs}`;

    // Fill start/end times
    const now = new Date();
    const endTime = now;
    const startTime = new Date(now.getTime() - durationSeconds * 1000);

    const fieldsToUpdate = [timeFields.hourInput, timeFields.minInput, timeFields.secInput, timeFields.hiddenTime];

    if (startField) {
      startField.value = window.TimeParser.formatDate(startTime);
      console.log('Set work_start to:', window.TimeParser.formatDate(startTime));
      fieldsToUpdate.push(startField);
    } else {
      console.warn('⚠ work_start field not found, skipping');
    }

    if (endField) {
      endField.value = window.TimeParser.formatDate(endTime);
      console.log('Set work_end to:', window.TimeParser.formatDate(endTime));
      fieldsToUpdate.push(endField);
    } else {
      console.warn('⚠ work_end field not found, skipping');
    }

    // Fill work notes
    const workNotesText = getLastWorkNote(doc);
    const workNotesFields = await fillWorkNotes(doc, workNotesField, workNotesEditable, workNotesText);
    fieldsToUpdate.push(...workNotesFields);

    // Fill work type
    const workTypeFields = fillWorkType(doc, workTypeField);
    fieldsToUpdate.push(...workTypeFields);

    // Dispatch events on all fields
    console.log('Dispatching events on', fieldsToUpdate.length, 'fields');
    fieldsToUpdate.forEach(field => {
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
    });

    console.log('✓ Time filled successfully!');
    return { success: true };
  } catch (error) {
    console.error('✗ Error filling time:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Process alert cleared workflow - fills time, sets state to resolved, and fills resolution fields
 * @param {Document} doc - Document containing the form
 * @returns {Promise<{success: boolean, error?: string}>} Result object
 */
window.FormFiller.processAlertCleared = async function(doc) {
  console.log('=== PROCESSING ALERT CLEARED WORKFLOW ===');
  console.log('Document URL:', doc.location.href);
  console.log('Document readyState:', doc.readyState);

  // Save scroll positions to restore later
  const scrollPositions = {
    window: { x: window.scrollX || window.pageXOffset, y: window.scrollY || window.pageYOffset },
    document: { x: doc.documentElement.scrollLeft, y: doc.documentElement.scrollTop },
    body: { x: doc.body.scrollLeft, y: doc.body.scrollTop }
  };

  // Helper to restore scroll position
  const restoreScroll = () => {
    try {
      window.scrollTo(scrollPositions.window.x, scrollPositions.window.y);
      doc.documentElement.scrollLeft = scrollPositions.document.x;
      doc.documentElement.scrollTop = scrollPositions.document.y;
      doc.body.scrollLeft = scrollPositions.body.x;
      doc.body.scrollTop = scrollPositions.body.y;
    } catch (e) {
      console.log('Could not restore scroll position:', e.message);
    }
  };

  try {
    // Step 1: Fill time to 15 minutes
    const timeValue = '15 minutes';
    const durationSeconds = window.TimeParser.parseDuration(timeValue);
    
    const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
    const startField = await window.FieldFinder.findWorkStartField(doc);
    const endField = await window.FieldFinder.findWorkEndField(doc);
    const { field: workNotesField, editable: workNotesEditable } = await window.FieldFinder.findWorkNotesField(doc);

    // Fill time worked (15 minutes)
    const hours = Math.floor(durationSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((durationSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = '00';
    timeFields.hourInput.value = hours;
    timeFields.minInput.value = mins;
    timeFields.secInput.value = secs;
    timeFields.hiddenTime.value = `${hours}:${mins}:${secs}`;

    // Fill start/end times
    const now = new Date();
    const endTime = now;
    const startTime = new Date(now.getTime() - durationSeconds * 1000);

    const fieldsToUpdate = [timeFields.hourInput, timeFields.minInput, timeFields.secInput, timeFields.hiddenTime];

    if (startField) {
      startField.value = window.TimeParser.formatDate(startTime);
      fieldsToUpdate.push(startField);
    }
    if (endField) {
      endField.value = window.TimeParser.formatDate(endTime);
      fieldsToUpdate.push(endField);
    }

    // Step 2: Set work notes to "alert cleared"
    const workNotesText = 'Alert cleared. Closing ticket.';
    // Use the same fillWorkNotes function logic inline
    if (workNotesField) {
      // Try g_form API first
      if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
        try {
          doc.defaultView.g_form.setValue('work_notes', workNotesText);
          console.log('✓ Set work_notes using g_form.setValue()');
        } catch (e) {
          console.log('g_form.setValue for work_notes failed:', e.message);
        }
      }
      
      // Direct value setting
      workNotesField.value = workNotesText;
      workNotesField.dispatchEvent(new Event('input', { bubbles: true }));
      workNotesField.dispatchEvent(new Event('change', { bubbles: true }));
      fieldsToUpdate.push(workNotesField);
    }

    // Step 3: Set state to "resolved" (value is typically 6)
    const stateField = await window.FieldFinder.findStateField(doc);
    if (stateField) {
      if (stateField.tagName === 'SELECT') {
        // Try to find "Resolved" option
        const options = Array.from(stateField.options);
        let resolvedOption = options.find(o => 
          o.text.toLowerCase().includes('resolved') || 
          o.value === '6' || 
          o.value === 'resolved'
        );
        
        if (resolvedOption) {
          if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
            try {
              doc.defaultView.g_form.setValue('state', resolvedOption.value);
              console.log('✓ Set state using g_form.setValue() to:', resolvedOption.text);
            } catch (e) {
              console.log('g_form.setValue for state failed, using direct value:', e.message);
              stateField.value = resolvedOption.value;
            }
          } else {
            stateField.value = resolvedOption.value;
          }
          console.log('Set state to:', resolvedOption.text, '(value:', resolvedOption.value + ')');
        } else {
          // Fallback: try value 6 directly
          stateField.value = '6';
          console.log('Set state to value: 6');
        }
      } else {
        stateField.value = '6';
        console.log('Set state input to: 6');
      }
      fieldsToUpdate.push(stateField);
    } else {
      console.warn('⚠ state field not found, skipping');
    }

    // Step 4: Open resolution information tab
    // Look for tab elements - ServiceNow uses various tab structures
    // Exclude info icons and buttons that aren't actual tabs
    const resolutionTabSelectors = [
      'a[aria-label*="Resolution"][role="tab"]',
      'a[aria-label*="Resolution"]:not([class*="info"]):not([class*="icon"])',
      'button[aria-label*="Resolution"][role="tab"]',
      'a[href*="#resolution"]:not([class*="info"]):not([class*="icon"])',
      'a[href*="#tab_resolution"]'
    ];

    let resolutionTab = null;
    for (const selector of resolutionTabSelectors) {
      try {
        const elements = doc.querySelectorAll(selector);
        for (const elem of elements) {
          // Verify it's actually a tab, not an info icon
          const text = (elem.textContent || elem.innerText || '').trim().toLowerCase();
          const ariaLabel = (elem.getAttribute('aria-label') || '').toLowerCase();
          const className = (elem.className || '').toLowerCase();
          
          // Skip if it looks like an info icon (single character, icon class, etc.)
          if (text.length <= 2 && (className.includes('icon') || className.includes('info'))) {
            continue;
          }
          
          // Prefer elements that have "Resolution" in visible text or aria-label
          if ((text.includes('resolution') || ariaLabel.includes('resolution')) && 
              !className.includes('info') && 
              !className.includes('icon')) {
            resolutionTab = elem;
            console.log('Found resolution tab with selector:', selector);
            break;
          }
        }
        if (resolutionTab) break;
      } catch (e) {
        // Some selectors might not work with querySelector
      }
    }

    // Also try finding by text content, but exclude small elements (likely icons)
    if (!resolutionTab) {
      const allLinks = doc.querySelectorAll('a[role="tab"], button[role="tab"], a.nav-link, button.nav-link');
      for (const link of allLinks) {
        const text = (link.textContent || link.innerText || '').trim().toLowerCase();
        const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();
        const className = (link.className || '').toLowerCase();
        
        // Skip info icons - they're usually small, have icon classes, or single characters
        if (text.length <= 2 || className.includes('info') || className.includes('icon')) {
          continue;
        }
        
        if ((text.includes('resolution') || ariaLabel.includes('resolution')) && 
            !className.includes('info') && 
            !className.includes('icon')) {
          resolutionTab = link;
          console.log('Found resolution tab by text content');
          break;
        }
      }
    }

    if (resolutionTab) {
      console.log('Clicking resolution tab...');
      // Save scroll position before clicking
      const beforeClickScroll = {
        window: { x: window.scrollX || window.pageXOffset, y: window.scrollY || window.pageYOffset },
        document: { x: doc.documentElement.scrollLeft, y: doc.documentElement.scrollTop }
      };
      
      // Click the tab
      resolutionTab.click();
      
      // Immediately restore scroll position to prevent scrolling
      restoreScroll();
      
      // Wait a bit for tab to open, then restore scroll again
      await new Promise(resolve => setTimeout(resolve, 100));
      restoreScroll();
      
      await new Promise(resolve => setTimeout(resolve, 400));
      restoreScroll();
    } else {
      console.warn('⚠ Resolution tab not found, continuing anyway');
    }

    // Step 5: Set resolution code to "resolved - permanently"
    const resolutionCodeField = await window.FieldFinder.findResolutionCodeField(doc);
    if (resolutionCodeField) {
      if (resolutionCodeField.tagName === 'SELECT') {
        const options = Array.from(resolutionCodeField.options);
        let resolvedPermanentlyOption = options.find(o => 
          o.text.toLowerCase().includes('resolved - permanently') ||
          o.text.toLowerCase().includes('resolved permanently') ||
          o.text.toLowerCase().includes('permanently')
        );

        if (resolvedPermanentlyOption) {
          if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
            try {
              doc.defaultView.g_form.setValue('close_code', resolvedPermanentlyOption.value);
              console.log('✓ Set resolution_code using g_form.setValue() to:', resolvedPermanentlyOption.text);
            } catch (e) {
              console.log('g_form.setValue for resolution_code failed, using direct value:', e.message);
              resolutionCodeField.value = resolvedPermanentlyOption.value;
            }
          } else {
            resolutionCodeField.value = resolvedPermanentlyOption.value;
          }
          console.log('Set resolution_code to:', resolvedPermanentlyOption.text);
        } else {
          console.warn('⚠ "Resolved - permanently" option not found in resolution_code dropdown');
        }
      }
      fieldsToUpdate.push(resolutionCodeField);
    } else {
      console.warn('⚠ resolution_code field not found, skipping');
    }

    // Step 6: Set resolution notes to "Alert cleared. Closing ticket."
    const closeNotesField = await window.FieldFinder.findCloseNotesField(doc);
    if (closeNotesField) {
      const resolutionNotesText = 'Alert cleared. Closing ticket.';
      
      // Try g_form API first
      if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
        try {
          doc.defaultView.g_form.setValue('close_notes', resolutionNotesText);
          console.log('✓ Set close_notes using g_form.setValue()');
        } catch (e) {
          console.log('g_form.setValue for close_notes failed, using direct value:', e.message);
          closeNotesField.value = resolutionNotesText;
        }
      } else {
        closeNotesField.value = resolutionNotesText;
      }

      // Trigger events
      closeNotesField.dispatchEvent(new Event('input', { bubbles: true }));
      closeNotesField.dispatchEvent(new Event('change', { bubbles: true }));
      closeNotesField.dispatchEvent(new Event('blur', { bubbles: true }));
      
      fieldsToUpdate.push(closeNotesField);
      console.log('Set close_notes to:', resolutionNotesText);
    } else {
      console.warn('⚠ close_notes field not found, skipping');
    }

    // Dispatch events on all fields without triggering focus (which causes scrolling)
    console.log('Dispatching events on', fieldsToUpdate.length, 'fields');
    fieldsToUpdate.forEach(field => {
      // Don't call focus() - it causes scrolling
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      // Skip blur event as it might trigger scrolling
    });

    // Restore scroll position one final time
    restoreScroll();
    
    // Small delay then restore again to catch any async scrolling
    await new Promise(resolve => setTimeout(resolve, 100));
    restoreScroll();

    console.log('✓ Alert cleared workflow completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('✗ Error processing alert cleared workflow:', error);
    // Restore scroll position even on error
    restoreScroll();
    return { success: false, error: error.message };
  }
};

// Export for convenience
const processIncidentForm = window.FormFiller.processIncidentForm;

