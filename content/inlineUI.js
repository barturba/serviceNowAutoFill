/**
 * Inline UI injector for ServiceNow Time Entry Assistant
 * Injects a minimalist UI inline with the Time Worked field
 */

(function() {
  'use strict';

  // Configuration
  const TIME_WORKED_SELECTORS = [
    '#element\\.incident\\.time_worked',
    '#element\\.sc_task\\.time_worked',
    '[id^="element."][id$=".time_worked"]',
    'input[id$=".time_worked"]',
    'input[name$=".time_worked"]',
    'input[id*="time_worked"]',
    'input[name*="time_worked"]',
    '[data-type="timer"]',
    '.glide_timer'
  ];
  const RETRY_DELAY = 500;
  const MAX_RETRIES = 20;
  
  const TIME_OPTIONS = [
    { value: '30 minutes', label: '30 min' },
    { value: '45 minutes', label: '45 min' },
    { value: '1 hour', label: '1 hour' },
    { value: '1 hour 30 minutes', label: '1.5 hours' },
    { value: '2 hours', label: '2 hours' }
  ];

  const MACD_BUTTON_ID = 'sn-macd-assignment-btn';
  const MACD_TEXT_REGEX = /\bMACD\b/i;
  const STATE_ASSIGNED_TEXT = 'Assigned';
  const ASSIGNMENT_GROUP_VALUE = 'MS MACD';
  const TASK_TARGET = 'sc_task';
  const MACD_CHECK_DEBOUNCE = 300;
  const STYLE_ID = 'sn-time-assistant-styles';
  const MAIN_IFRAME_SELECTOR = '#gsft_main, iframe#gsft_main, iframe[name="gsft_main"]';

  let injectedDocs = new WeakSet();
  let macdButtonInjected = false;
  let macdCheckTimer = null;
  let trackedFrame = null;

  /**
   * Wait for the Time Worked field to be available
   */
  async function waitForTimeWorkedField(retries = 0) {
    const result = findTimeWorkedElement();
    if (result) {
      return result;
    }

    if (retries >= MAX_RETRIES) {
      console.log('ServiceNow Time Assistant: Time Worked field not found after max retries');
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return waitForTimeWorkedField(retries + 1);
  }

  function getRecordTarget() {
    const topParams = new URLSearchParams(window.location.search);
    const topTarget = topParams.get('sysparm_record_target');
    if (topTarget) return topTarget;

    const frame = document.querySelector(MAIN_IFRAME_SELECTOR);
    const src = frame?.getAttribute('src') || frame?.contentWindow?.location?.search;
    if (src) {
      const qs = src.includes('?') ? src.split('?')[1] : src;
      const params = new URLSearchParams(qs);
      return params.get('sysparm_record_target');
    }
    return null;
  }

  function getDocumentContexts() {
    const contexts = [document];
    const frames = Array.from(document.querySelectorAll('iframe'));
    frames.forEach(frame => {
      try {
        if (frame.contentDocument) {
          contexts.push(frame.contentDocument);
        }
      } catch (e) {
        // cross-origin; skip
      }
    });
    const mainFrame = document.querySelector(MAIN_IFRAME_SELECTOR);
    if (mainFrame && mainFrame.contentDocument && !contexts.includes(mainFrame.contentDocument)) {
      contexts.push(mainFrame.contentDocument);
    }
    return contexts;
  }

  function attachFrameLoadHandler() {
    const frame = document.querySelector(MAIN_IFRAME_SELECTOR);
    if (!frame || frame === trackedFrame) return;
    trackedFrame = frame;
    frame.addEventListener('load', () => {
      injectedDocs = new WeakSet();
      debouncedMacdCheck();
      // Give the frame a brief moment to render before searching
      setTimeout(() => {
        injectUI();
      }, 200);
    });
  }

  function findTimeWorkedElement() {
    const target = getRecordTarget();
    const contexts = getDocumentContexts();

    // Prioritize incident/doc contexts first when target is incident
    const ordered = [...contexts];
    if (target === 'incident') {
      const frameDoc = document.querySelector(MAIN_IFRAME_SELECTOR)?.contentDocument;
      if (frameDoc && !ordered.includes(frameDoc)) {
        ordered.unshift(frameDoc);
      }
    }

    for (const ctx of ordered) {
      for (const selector of TIME_WORKED_SELECTORS) {
        const el = ctx.querySelector(selector);
        if (el) {
          const container = el.closest('.form-group') || el.parentElement;
          return { element: container || el, doc: ctx };
        }
      }

      const labels = Array.from(ctx.querySelectorAll('label'));
      const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes('time worked'));
      if (label) {
        const container = label.closest('.form-group') || label.parentElement;
        if (container) return { element: container, doc: ctx };
      }
    }

    return null;
  }

  /**
   * Create the inline UI element
   */
  function createInlineUI(doc) {
    const container = doc.createElement('div');
    container.className = 'sn-time-assistant-container';
    container.innerHTML = `
      <input 
        type="text" 
        class="sn-time-assistant-input" 
        id="sn-time-assistant-comments"
        placeholder="Additional comments"
        aria-label="Additional comments for time entry"
      />
      <button 
        class="sn-time-assistant-btn" 
        id="sn-time-assistant-15min"
        data-time="15 minutes"
        aria-label="Fill 15 minutes and save"
      >
        15 min
      </button>
      <select 
        class="sn-time-assistant-dropdown" 
        id="sn-time-assistant-more"
        aria-label="Select other time duration"
      >
        <option value="">More...</option>
        ${TIME_OPTIONS.map(opt => 
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('')}
      </select>
    `;
    return container;
  }
  /**
   * Ensure assistant styles are available
   */
  function ensureStyles(doc) {
    const targetDoc = doc || document;
    if (targetDoc.getElementById(STYLE_ID)) return;
    const style = targetDoc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sn-time-assistant-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 8px 0;
        flex-wrap: wrap;
      }
      .sn-time-assistant-input {
        min-width: 220px;
        padding: 6px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 13px;
      }
      .sn-time-assistant-btn {
        background: #005eb8;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        cursor: pointer;
        font-weight: 600;
      }
      .sn-time-assistant-btn.loading {
        opacity: 0.7;
        cursor: wait;
      }
      .sn-time-assistant-dropdown {
        padding: 6px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 13px;
        min-width: 140px;
      }
    `;
    (targetDoc.head || document.head).appendChild(style);
  }

  /**
   * Show a temporary message
   */
  function showMessage(message, type = 'success', doc = document) {
    const messageEl = doc.createElement('div');
    messageEl.className = `sn-time-assistant-message ${type}`;
    messageEl.textContent = message;
    (doc.body || document.body).appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  /**
   * Handle time entry action
   */
  async function handleTimeEntry(timeValue, button, doc = document) {
    const commentsInput = doc.getElementById('sn-time-assistant-comments');
    const commentText = commentsInput?.value || '';
    
    // Show loading state
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      // Call the existing fill function that's injected into the page
      if (typeof window.fillTimeInNestedFrameAndSave !== 'function') {
        throw new Error('Time entry function not available. Please refresh the page.');
      }
      
      const result = await window.fillTimeInNestedFrameAndSave(timeValue, commentText);
      
      if (result.success) {
        showMessage(`✓ Time entry saved: ${timeValue}`, 'success', doc);
        // Clear the comments field on success
        if (commentsInput) {
          commentsInput.value = '';
        }
      } else {
        showMessage(`✗ Error: ${result.error || 'Unknown error'}`, 'error', doc);
      }
    } catch (error) {
      console.error('ServiceNow Time Assistant error:', error);
      showMessage(`✗ Error: ${error.message}`, 'error', doc);
    } finally {
      // Remove loading state
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  /**
   * Setup event handlers
   */
  function setupEventHandlers(doc) {
    const btn15min = doc.getElementById('sn-time-assistant-15min');
    const dropdownMore = doc.getElementById('sn-time-assistant-more');
    
    if (btn15min) {
      btn15min.addEventListener('click', () => {
        handleTimeEntry('15 minutes', btn15min, doc);
      });
    }
    
    if (dropdownMore) {
      dropdownMore.addEventListener('change', (e) => {
        const timeValue = e.target.value;
        if (timeValue) {
          handleTimeEntry(timeValue, dropdownMore, doc);
          // Reset dropdown after handling
          setTimeout(() => {
            e.target.value = '';
          }, 100);
        }
      });
    }
  }

  /**
   * Inject the UI into the page
   */
  function isUiPresent(doc) {
    return !!doc.getElementById('sn-time-assistant-comments');
  }

  async function injectUI() {
    const timeWorkedResult = await waitForTimeWorkedField();
    if (!timeWorkedResult) {
      console.log('ServiceNow Time Assistant: Could not find Time Worked field');
      return;
    }
    const { element: timeWorkedElement, doc } = timeWorkedResult;
    if (injectedDocs.has(doc) || isUiPresent(doc)) {
      return;
    }
    
    ensureStyles(doc);

    // Create and inject the UI at the beginning of the form-group
    // This will make it appear to the left of the Time Worked label
    const inlineUI = createInlineUI(doc);
    timeWorkedElement.insertBefore(inlineUI, timeWorkedElement.firstChild);
    
    setupEventHandlers(doc);
    injectedDocs.add(doc);
    
    console.log('ServiceNow Time Assistant: Inline UI injected successfully');
  }

  /**
   * Helpers for MACD button
   */
  function isTaskPage() {
    const params = new URLSearchParams(window.location.search);
    return params.get('sysparm_record_target') === TASK_TARGET;
  }

  function pageHasMacdText() {
    return getDocumentContexts().some(ctx => {
      const bodyText = ctx.body?.innerText || '';
      return MACD_TEXT_REGEX.test(bodyText);
    });
  }

  function findFieldByLabelText(labelText) {
    const contexts = getDocumentContexts();
    const lower = labelText.toLowerCase();
    for (const ctx of contexts) {
      const labels = Array.from(ctx.querySelectorAll('label'));
      const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes(lower));
      if (!label) continue;

      if (label.htmlFor) {
        const direct = ctx.getElementById(label.htmlFor);
        const displayField = ctx.getElementById(`sys_display.${label.htmlFor}`);
        if (displayField) return displayField;
        if (direct) return direct;
      }

      const container = label.closest('.form-group, tr, td, .sn-form-field') || label.parentElement;
      if (!container) continue;
      const field = container.querySelector('input, select, textarea');
      if (field) return field;
    }
    return null;
  }

  function dispatchValueEvents(element) {
    ['input', 'change', 'blur'].forEach(type => {
      element.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  function setStateAssigned() {
    const stateField = findFieldByLabelText('State');
    if (!stateField) {
      console.warn('MACD helper: State field not found');
      return;
    }

    if (stateField.tagName === 'SELECT') {
      const options = Array.from(stateField.options);
      const targetOption = options.find(opt => (opt.textContent || '').trim().toLowerCase() === STATE_ASSIGNED_TEXT.toLowerCase());
      if (targetOption) {
        stateField.value = targetOption.value;
      } else {
        // fallback to setting display text directly
        stateField.value = STATE_ASSIGNED_TEXT;
      }
    } else {
      stateField.value = STATE_ASSIGNED_TEXT;
    }

    dispatchValueEvents(stateField);
  }

  function setAssignmentGroup() {
    const assignmentField = findFieldByLabelText('Assignment group');
    if (!assignmentField) {
      console.warn('MACD helper: Assignment Group field not found');
      return;
    }

    assignmentField.value = ASSIGNMENT_GROUP_VALUE;
    dispatchValueEvents(assignmentField);

    const hiddenId = assignmentField.id?.replace('sys_display.', '');
    if (hiddenId) {
      const targetDoc = assignmentField.ownerDocument || document;
      const hiddenField = targetDoc.getElementById(hiddenId);
      if (hiddenField) {
        hiddenField.value = '';
        dispatchValueEvents(hiddenField);
      }
    }
  }

  function removeMacdButton() {
    getDocumentContexts().forEach(ctx => {
      const existing = ctx.getElementById(MACD_BUTTON_ID);
      if (existing) {
        existing.remove();
      }
    });
    macdButtonInjected = false;
  }

  function placeMacdButton(button, assignmentField) {
    const formGroup = assignmentField.closest('.form-group');
    const addons = formGroup?.querySelector('.form-field-addons');
    if (addons) {
      addons.appendChild(button);
      return;
    }

    const container = assignmentField.closest('.ref-container, .input-group, .sn-form-field, td') || assignmentField.parentElement;
    if (container) {
      container.appendChild(button);
      return;
    }

    assignmentField.insertAdjacentElement('afterend', button);
  }

  function handleMacdClick() {
    try {
      setStateAssigned();
      setAssignmentGroup();
    } catch (error) {
      console.error('MACD helper error:', error);
    }
  }

  function ensureMacdButton() {
    if (!isTaskPage() || !pageHasMacdText()) {
      removeMacdButton();
      return;
    }

    const assignmentField = findFieldByLabelText('Assignment group');
    if (!assignmentField) {
      return;
    }

    const doc = assignmentField.ownerDocument || document;
    const existing = doc.getElementById(MACD_BUTTON_ID);
    if (existing) {
      placeMacdButton(existing, assignmentField);
      macdButtonInjected = true;
      return;
    }

    const button = doc.createElement('button');
    button.id = MACD_BUTTON_ID;
    button.type = 'button';
    button.textContent = 'MACD';
    button.style.marginLeft = '8px';
    button.style.padding = '4px 8px';
    button.style.background = '#005eb8';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', handleMacdClick);

    placeMacdButton(button, assignmentField);
    macdButtonInjected = true;
  }

  function debouncedMacdCheck() {
    if (macdCheckTimer) {
      clearTimeout(macdCheckTimer);
    }
    macdCheckTimer = setTimeout(() => {
      macdCheckTimer = null;
      ensureMacdButton();
    }, MACD_CHECK_DEBOUNCE);
  }

  /**
   * Initialize the extension
   */
  function init() {
    attachFrameLoadHandler();
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectUI);
      document.addEventListener('DOMContentLoaded', debouncedMacdCheck);
      document.addEventListener('DOMContentLoaded', attachFrameLoadHandler);
    } else {
      // DOM is already loaded
      injectUI();
      debouncedMacdCheck();
      attachFrameLoadHandler();
    }
    
    // Also watch for dynamic page changes (ServiceNow is a SPA)
    const observer = new MutationObserver(() => {
      injectUI();
      debouncedMacdCheck();
      attachFrameLoadHandler();
    });

    getDocumentContexts().forEach(ctx => {
      if (ctx.body) {
        observer.observe(ctx.body, {
          childList: true,
          subtree: true
        });
      }
    });
  }

  // Start initialization
  init();
})();

