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
    '[id^="element."][id$=".time_worked"]'
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

  let uiInjected = false;
  let macdButtonInjected = false;
  let macdCheckTimer = null;

  /**
   * Wait for the Time Worked field to be available
   */
  async function waitForTimeWorkedField(retries = 0) {
    const element = findTimeWorkedElement();
    if (element) {
      return element;
    }

    if (retries >= MAX_RETRIES) {
      console.log('ServiceNow Time Assistant: Time Worked field not found after max retries');
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return waitForTimeWorkedField(retries + 1);
  }

  function findTimeWorkedElement() {
    for (const selector of TIME_WORKED_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return el;
    }

    // fallback: locate by label text
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes('time worked'));
    if (label) {
      return label.closest('.form-group') || label.parentElement;
    }

    return null;
  }

  /**
   * Create the inline UI element
   */
  function createInlineUI() {
    const container = document.createElement('div');
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
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
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
    document.head.appendChild(style);
  }

  /**
   * Show a temporary message
   */
  function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `sn-time-assistant-message ${type}`;
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  /**
   * Handle time entry action
   */
  async function handleTimeEntry(timeValue, button) {
    const commentsInput = document.getElementById('sn-time-assistant-comments');
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
        showMessage(`✓ Time entry saved: ${timeValue}`, 'success');
        // Clear the comments field on success
        if (commentsInput) {
          commentsInput.value = '';
        }
      } else {
        showMessage(`✗ Error: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('ServiceNow Time Assistant error:', error);
      showMessage(`✗ Error: ${error.message}`, 'error');
    } finally {
      // Remove loading state
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  /**
   * Setup event handlers
   */
  function setupEventHandlers() {
    const btn15min = document.getElementById('sn-time-assistant-15min');
    const dropdownMore = document.getElementById('sn-time-assistant-more');
    
    if (btn15min) {
      btn15min.addEventListener('click', () => {
        handleTimeEntry('15 minutes', btn15min);
      });
    }
    
    if (dropdownMore) {
      dropdownMore.addEventListener('change', (e) => {
        const timeValue = e.target.value;
        if (timeValue) {
          handleTimeEntry(timeValue, dropdownMore);
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
  async function injectUI() {
    if (uiInjected) return;
    
    const timeWorkedElement = await waitForTimeWorkedField();
    if (!timeWorkedElement) {
      console.log('ServiceNow Time Assistant: Could not find Time Worked field');
      return;
    }
    
    ensureStyles();

    // Create and inject the UI at the beginning of the form-group
    // This will make it appear to the left of the Time Worked label
    const inlineUI = createInlineUI();
    timeWorkedElement.insertBefore(inlineUI, timeWorkedElement.firstChild);
    
    setupEventHandlers();
    uiInjected = true;
    
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
    const bodyText = document.body?.innerText || '';
    return MACD_TEXT_REGEX.test(bodyText);
  }

  function findFieldByLabelText(labelText) {
    const lower = labelText.toLowerCase();
    const labels = Array.from(document.querySelectorAll('label'));
    const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes(lower));
    if (!label) return null;

    if (label.htmlFor) {
      const direct = document.getElementById(label.htmlFor);
      const displayField = document.getElementById(`sys_display.${label.htmlFor}`);
      if (displayField) return displayField;
      if (direct) return direct;
    }

    const container = label.closest('.form-group, tr, td, .sn-form-field') || label.parentElement;
    if (!container) return null;
    return container.querySelector('input, select, textarea');
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
      const hiddenField = document.getElementById(hiddenId);
      if (hiddenField) {
        hiddenField.value = '';
        dispatchValueEvents(hiddenField);
      }
    }
  }

  function removeMacdButton() {
    const existing = document.getElementById(MACD_BUTTON_ID);
    if (existing) {
      existing.remove();
    }
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

    const existing = document.getElementById(MACD_BUTTON_ID);
    if (existing) {
      placeMacdButton(existing, assignmentField);
      macdButtonInjected = true;
      return;
    }

    const button = document.createElement('button');
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
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectUI);
      document.addEventListener('DOMContentLoaded', debouncedMacdCheck);
    } else {
      // DOM is already loaded
      injectUI();
      debouncedMacdCheck();
    }
    
    // Also watch for dynamic page changes (ServiceNow is a SPA)
    const observer = new MutationObserver((mutations) => {
      if (!uiInjected) {
        injectUI();
      }
      debouncedMacdCheck();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start initialization
  init();
})();

