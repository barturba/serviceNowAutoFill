(function() {
  'use strict';

  const constants = {
    TIME_WORKED_SELECTORS: [
      '#element\\.incident\\.time_worked',
      '#element\\.sc_task\\.time_worked',
      '[id^="element."][id$=".time_worked"]',
      'input[id$=".time_worked"]',
      'input[name$=".time_worked"]',
      'input[id*="time_worked"]',
      'input[name*="time_worked"]',
      '[data-type="timer"]',
      '.glide_timer'
    ],
    RETRY_DELAY: 500,
    MAX_RETRIES: 20,
    TIME_OPTIONS: [
      { value: '30 minutes', label: '30 min' },
      { value: '45 minutes', label: '45 min' },
      { value: '1 hour', label: '1 hour' },
      { value: '1 hour 30 minutes', label: '1.5 hours' },
      { value: '2 hours', label: '2 hours' }
    ],
    MACD_BUTTON_ID: 'sn-macd-assignment-btn',
    MACD_TEXT_REGEX: /\bMACD\b/i,
    STATE_ASSIGNED_TEXT: 'Assigned',
    ASSIGNMENT_GROUP_VALUE: 'MS MACD',
    TASK_TARGET: 'sc_task',
    MACD_CHECK_DEBOUNCE: 300,
    STYLE_ID: 'sn-time-assistant-styles',
    MAIN_IFRAME_SELECTOR: '#gsft_main, iframe#gsft_main, iframe[name="gsft_main"]'
  };

  window.inlineUI = window.inlineUI || {};
  window.inlineUI.constants = constants;
})();

