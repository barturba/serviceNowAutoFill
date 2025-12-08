/**
 * Field diagnostics utilities
 */

/**
 * Log all potential form fields in the document
 * @param {Document} doc - The document to search (can be iframe document)
 */
function logAllFields(doc = document) {
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
}

/**
 * Test field detection and logging
 */
function testFieldDetection() {
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
}

// Make available globally
window.logAllFields = logAllFields;
window.testFieldDetection = testFieldDetection;

