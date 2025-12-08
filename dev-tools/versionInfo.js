/**
 * Version info utilities
 */

/**
 * Get extension version info
 */
function getVersionInfo() {
  console.log('📦 Extension Version Info');
  console.log('Name: ServiceNow Time Entry Assistant');
  console.log('Version: 2.0');
  console.log('Debug Mode:', typeof CONFIG !== 'undefined' ? CONFIG.DEBUG_MODE : 'CONFIG not loaded');
}

// Make available globally
window.getVersionInfo = getVersionInfo;

