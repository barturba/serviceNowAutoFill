/**
 * Alert cleared workflow processor
 */

/**
 * Process alert cleared workflow - fills time, sets state to resolved, and fills resolution fields
 * @param {Document} doc - Document containing the form
 * @returns {Promise<{success: boolean, error?: string}>} Result object
 */
async function processAlertCleared(doc) {
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
    const { field: workNotesField } = await window.FieldFinder.findWorkNotesField(doc);

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
    if (workNotesField) {
      if (typeof doc.defaultView.g_form !== 'undefined' && doc.defaultView.g_form) {
        try {
          doc.defaultView.g_form.setValue('work_notes', workNotesText);
          console.log('✓ Set work_notes using g_form.setValue()');
        } catch (e) {
          console.log('g_form.setValue for work_notes failed:', e.message);
        }
      }
      
      workNotesField.value = workNotesText;
      workNotesField.dispatchEvent(new Event('input', { bubbles: true }));
      workNotesField.dispatchEvent(new Event('change', { bubbles: true }));
      fieldsToUpdate.push(workNotesField);
    }

    // Step 3: Set state to "resolved" (value is typically 6)
    const stateField = await window.FieldFinder.findStateField(doc);
    if (stateField) {
      if (stateField.tagName === 'SELECT') {
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
          const text = (elem.textContent || elem.innerText || '').trim().toLowerCase();
          const ariaLabel = (elem.getAttribute('aria-label') || '').toLowerCase();
          const className = (elem.className || '').toLowerCase();
          
          if (text.length <= 2 && (className.includes('icon') || className.includes('info'))) {
            continue;
          }
          
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

    if (!resolutionTab) {
      const allLinks = doc.querySelectorAll('a[role="tab"], button[role="tab"], a.nav-link, button.nav-link');
      for (const link of allLinks) {
        const text = (link.textContent || link.innerText || '').trim().toLowerCase();
        const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();
        const className = (link.className || '').toLowerCase();
        
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
      const beforeClickScroll = {
        window: { x: window.scrollX || window.pageXOffset, y: window.scrollY || window.pageYOffset },
        document: { x: doc.documentElement.scrollLeft, y: doc.documentElement.scrollTop }
      };
      
      resolutionTab.click();
      restoreScroll();
      
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

      closeNotesField.dispatchEvent(new Event('input', { bubbles: true }));
      closeNotesField.dispatchEvent(new Event('change', { bubbles: true }));
      closeNotesField.dispatchEvent(new Event('blur', { bubbles: true }));
      
      fieldsToUpdate.push(closeNotesField);
      console.log('Set close_notes to:', resolutionNotesText);
    } else {
      console.warn('⚠ close_notes field not found, skipping');
    }

    // Dispatch events on all fields
    console.log('Dispatching events on', fieldsToUpdate.length, 'fields');
    fieldsToUpdate.forEach(field => {
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });

    restoreScroll();
    await new Promise(resolve => setTimeout(resolve, 100));
    restoreScroll();

    console.log('✓ Alert cleared workflow completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('✗ Error processing alert cleared workflow:', error);
    restoreScroll();
    return { success: false, error: error.message };
  }
}

// Make available globally
window.FormFiller = window.FormFiller || {};
window.FormFiller.processAlertCleared = processAlertCleared;

