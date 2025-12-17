/**
 * Inline UI injector for ServiceNow Time Entry Assistant
 * Injects a minimalist UI inline with the Time Worked field
 */

(function() {
  'use strict';

  // Configuration
  const TIME_WORKED_SELECTOR = '#element\\.incident\\.time_worked';
  const RETRY_DELAY = 500;
  const MAX_RETRIES = 20;
  
  const TIME_OPTIONS = [
    { value: '30 minutes', label: '30 min' },
    { value: '45 minutes', label: '45 min' },
    { value: '1 hour', label: '1 hour' },
    { value: '1 hour 30 minutes', label: '1.5 hours' },
    { value: '2 hours', label: '2 hours' }
  ];

  let uiInjected = false;

  /**
   * Wait for the Time Worked field to be available
   */
  async function waitForTimeWorkedField(retries = 0) {
    const element = document.querySelector(TIME_WORKED_SELECTOR);
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
    
    // Create and inject the UI at the beginning of the form-group
    // This will make it appear to the left of the Time Worked label
    const inlineUI = createInlineUI();
    timeWorkedElement.insertBefore(inlineUI, timeWorkedElement.firstChild);
    
    setupEventHandlers();
    uiInjected = true;
    
    console.log('ServiceNow Time Assistant: Inline UI injected successfully');
  }

  /**
   * Initialize the extension
   */
  function init() {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectUI);
    } else {
      // DOM is already loaded
      injectUI();
    }
    
    // Also watch for dynamic page changes (ServiceNow is a SPA)
    const observer = new MutationObserver((mutations) => {
      if (!uiInjected) {
        injectUI();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start initialization
  init();
})();

