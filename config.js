// Configuration for ServiceNow Time Entry Extension
const CONFIG = {
  // Debug mode - set to true to enable verbose logging
  DEBUG_MODE: false,

  // Field settings
  DEFAULT_WORK_NOTES_TEXT: 'updating time',

  // Timeout settings (in milliseconds)
  FIELD_SEARCH_TIMEOUT: 10000,     // 10 seconds to find form fields
  IFRAME_SEARCH_TIMEOUT: 15000,    // 15 seconds to find iframe
  IFRAME_LOAD_TIMEOUT: 5000,       // 5 seconds for iframe to load

  // Field selectors priority order
  FIELD_SELECTORS: {
    work_start: [
      'input[id="incident.u_work_start"]',
      'input[name="incident.u_work_start"]',
      'input[id$="u_work_start"]',
      'input[id*="work_start"]'
    ],
    work_end: [
      'input[id="incident.u_work_end"]',
      'input[name="incident.u_work_end"]',
      'input[id$="u_work_end"]',
      'input[id*="work_end"]'
    ],
    work_notes: [
      'textarea[id="incident.work_notes"]',
      'textarea[id$="work_notes"]',
      'input[id="incident.work_notes"]',
      'textarea[id*="work_notes"]',
      'input[id*="work_notes"]'
    ]
  }
};
