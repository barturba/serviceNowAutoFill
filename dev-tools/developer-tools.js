/**
 * Developer Diagnostic Tools for ServiceNow Time Entry Extension
 *
 * This file orchestrates diagnostic utilities from separate modules.
 * To use: Uncomment the import in popup.html or call functions from console.
 *
 * Usage:
 *   1. Open Chrome DevTools on ServiceNow page
 *   2. Run: DEV_TOOLS.logAllFields(document)
 *   3. Run: DEV_TOOLS.findAllIframes()
 */

const DEV_TOOLS = {
  logAllFields: window.logAllFields,
  findAllIframes: window.findAllIframes,
  testFieldDetection: window.testFieldDetection,
  getVersionInfo: window.getVersionInfo,
  runAll: () => {
    console.clear();
    console.log('🚀 Running all diagnostics...\n');
    DEV_TOOLS.getVersionInfo();
    console.log('\n');
    DEV_TOOLS.findAllIframes();
    console.log('\n');
    DEV_TOOLS.testFieldDetection();
    console.log('\n');
    DEV_TOOLS.logAllFields();
    console.log('\n✅ Diagnostics complete!');
  }
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.DEV_TOOLS = DEV_TOOLS;
  console.log('✨ DEV_TOOLS loaded. Run DEV_TOOLS.runAll() to see diagnostics.');
}
