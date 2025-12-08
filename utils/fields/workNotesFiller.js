/**
 * Fill work notes field utilities
 */

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
      const existingWorkNotes = doc.defaultView.g_form.getValue('work_notes') || '';
      console.log('Existing work_notes value from g_form:', existingWorkNotes);

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

    const existingContent = workNotesField.value || '';
    console.log('Existing work_notes content:', existingContent);

    const finalWorkNotesText = existingContent ? existingContent : workNotesText;
    console.log('Final work_notes text to set:', finalWorkNotesText);

    // Method 1: Try AngularJS scope manipulation
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

    await new Promise(resolve => setTimeout(resolve, 100));

    // Method 3: Use document.execCommand - only if no existing content
    if (!existingContent) {
      try {
        workNotesField.select();
        document.execCommand('insertText', false, finalWorkNotesText);
        console.log('Used execCommand to insert text');
      } catch (e) {
        console.log('execCommand failed, using direct value setting:', e.message);
      }
    }

    // Method 4: Direct value setting
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
    // Check parent wrapper
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

// Make available globally
window.fillWorkNotes = fillWorkNotes;

