/**
 * Developer Diagnostic Tools for ServiceNow Time Entry Extension
 *
 * This file contains utilities for debugging and development.
 * To use: Uncomment the import in popup.html or call functions from console.
 *
 * Usage:
 *   1. Open Chrome DevTools on ServiceNow page
 *   2. Run: DEV_TOOLS.logAllFields(document)
 *   3. Run: DEV_TOOLS.findAllIframes()
 */

const DEV_TOOLS = {
  /**
   * Log all potential form fields in the document
   * @param {Document} doc - The document to search (can be iframe document)
   */
  logAllFields: (doc = document) => {
    console.group('🔧 ServiceNow Field Diagnostics');

    // Time worked fields
    console.group('⏱️ Time Worked Fields');
    const timeWorkedElements = doc.querySelectorAll('[id*="time_worked"]');
    console.log('Count:', timeWorkedElements.length);
    timeWorkedElements.forEach((el, idx) => {
      console.log(`  [${idx}]`, {
        id: el.id,
        tag: el.tagName,
        type: el.type,
        value: el.value || '(empty)',
        visible: el.offsetParent !== null
      });
    });
    console.groupEnd();

    // Work start fields
    console.group('🚀 Work Start Fields');
    const workStartElements = doc.querySelectorAll('[id*="work_start"]');
    console.log('Count:', workStartElements.length);
    workStartElements.forEach((el, idx) => {
      console.log(`  [${idx}]`, {
        id: el.id,
        tag: el.tagName,
        type: el.type,
        value: el.value || '(empty)',
        visible: el.offsetParent !== null
      });
    });
    console.groupEnd();

    // Work end fields
    console.group('🏁 Work End Fields');
    const workEndElements = doc.querySelectorAll('[id*="work_end"]');
    console.log('Count:', workEndElements.length);
    workEndElements.forEach((el, idx) => {
      console.log(`  [${idx}]`, {
        id: el.id,
        tag: el.tagName,
        type: el.type,
        value: el.value || '(empty)',
        visible: el.offsetParent !== null
      });
    });
    console.groupEnd();

    // Work notes fields
    console.group('📝 Work Notes Fields');
    const workNotesElements = doc.querySelectorAll('[id*="work_notes"]');
    console.log('Count:', workNotesElements.length);
    workNotesElements.forEach((el, idx) => {
      console.log(`  [${idx}]`, {
        id: el.id,
        tag: el.tagName,
        type: el.type,
        value: (el.value || el.textContent || '(empty)').substring(0, 50),
        visible: el.offsetParent !== null
      });
    });
    console.groupEnd();

    console.groupEnd();
  },

  /**
   * Find and log all iframes on the page
   */
  findAllIframes: () => {
    console.group('🖼️ Iframe Detection');

    // Regular DOM iframes
    const regularIframes = document.querySelectorAll('iframe');
    console.log('Regular DOM iframes:', regularIframes.length);
    regularIframes.forEach((iframe, idx) => {
      console.log(`  [${idx}]`, {
        id: iframe.id,
        name: iframe.name,
        src: iframe.src?.substring(0, 100),
        title: iframe.title,
        visible: iframe.offsetParent !== null
      });
    });

    // Shadow DOM iframes
    console.log('\nSearching shadow DOM...');
    let shadowIframeCount = 0;
    const searchShadow = (root, depth = 0) => {
      const elements = root.querySelectorAll('*');
      elements.forEach(el => {
        if (el.shadowRoot) {
          const shadowIframes = el.shadowRoot.querySelectorAll('iframe');
          if (shadowIframes.length > 0) {
            console.log(`  Found ${shadowIframes.length} iframe(s) in shadow root of:`, {
              tag: el.tagName,
              id: el.id,
              depth: depth
            });
            shadowIframes.forEach((iframe, idx) => {
              console.log(`    [${shadowIframeCount++}]`, {
                id: iframe.id,
                name: iframe.name,
                src: iframe.src?.substring(0, 100),
                title: iframe.title
              });
            });
          }
          searchShadow(el.shadowRoot, depth + 1);
        }
      });
    };
    searchShadow(document);
    console.log('Shadow DOM iframes:', shadowIframeCount);

    console.groupEnd();
  },

  /**
   * Test field detection and logging
   */
  testFieldDetection: () => {
    console.group('🧪 Field Detection Test');

    // Check main document
    console.log('1. Checking main document...');
    const directTimeField = document.querySelector('[id*="time_worked"]');
    const directWorkStart = document.querySelector('[id*="work_start"]');
    console.log('  Direct fields found:', !!directTimeField || !!directWorkStart);

    // Check for iframe
    console.log('\n2. Checking for gsft_main iframe...');
    const mainIframe = document.querySelector('iframe#gsft_main') ||
                       document.querySelector('iframe[name="gsft_main"]');
    console.log('  Main iframe found:', !!mainIframe);

    if (mainIframe) {
      try {
        const iframeDoc = mainIframe.contentDocument;
        if (iframeDoc) {
          console.log('  Iframe accessible:', true);
          console.log('  Iframe readyState:', iframeDoc.readyState);
          const iframeTimeField = iframeDoc.querySelector('[id*="time_worked"]');
          console.log('  Time field in iframe:', !!iframeTimeField);
        }
      } catch (e) {
        console.error('  Cannot access iframe:', e.message);
      }
    }

    console.groupEnd();
  },

  /**
   * Get extension version info
   */
  getVersionInfo: () => {
    console.log('📦 Extension Version Info');
    console.log('Name: ServiceNow Time Entry Assistant');
    console.log('Version: 2.0');
    console.log('Debug Mode:', typeof CONFIG !== 'undefined' ? CONFIG.DEBUG_MODE : 'CONFIG not loaded');
  },

  /**
   * Run all diagnostics
   */
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
