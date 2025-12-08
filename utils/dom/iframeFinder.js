/**
 * Iframe finding utilities for ServiceNow pages
 */

// Use global namespace for injected scripts
window.IframeFinder = window.IframeFinder || {};

/**
 * Check if an iframe contains an incident form
 * @param {HTMLIFrameElement} iframe - The iframe element to check
 * @returns {boolean} True if iframe contains incident form
 */
window.IframeFinder.isIncidentFrame = function(iframe) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return false;
    const hasTimeWorked = !!doc.querySelector('[id*="time_worked"]');
    const hasIncidentForm = !!doc.querySelector('form[action*="incident"]') ||
                           doc.location.href.includes('incident');
    const hasWorkStart = !!doc.querySelector('[id*="work_start"]');
    return hasTimeWorked || hasIncidentForm || hasWorkStart;
  } catch (e) {
    // Cross-origin or access denied - can't check content
    return false;
  }
};

/**
 * Recursively search for iframe in shadow DOM and regular DOM
 * @param {Document|ShadowRoot} root - Root to search in
 * @param {string[]} iframeSelectors - Array of CSS selectors for iframes
 * @param {number} depth - Current depth (for logging)
 * @returns {HTMLIFrameElement|null} Found iframe or null
 */
window.IframeFinder.findInShadowRoots = function(root, iframeSelectors, depth = 0) {
  const indent = ' '.repeat(depth);
  console.log(`${indent}Searching at depth ${depth}, root:`, root.constructor.name);

  // Try all selectors in current root
  for (const selector of iframeSelectors) {
    try {
      const iframes = root.querySelectorAll(selector);
      if (iframes.length > 0) {
        console.log(`${indent}Found ${iframes.length} iframe(s) with selector '${selector}'`);
      }
      for (const iframe of iframes) {
        console.log(`${indent}Checking iframe:`, {
          selector,
          id: iframe.id,
          name: iframe.name,
          src: iframe.src?.substring(0, 100),
          title: iframe.title
        });
        // If we can access the iframe content, verify it's the right one
        if (window.IframeFinder.isIncidentFrame(iframe)) {
          console.log(`${indent}✓ Found incident iframe with content verification!`);
          return iframe;
        }
        // For specific ServiceNow iframe identifiers, trust them
        if (iframe.id === 'gsft_main' || iframe.name === 'gsft_main') {
          console.log(`${indent}✓ Found gsft_main iframe!`);
          return iframe;
        }
      }
    } catch (e) {
      console.log(`${indent}Error with selector '${selector}':`, e.message);
    }
  }

  // Recursively search in all shadow roots
  const allElements = Array.from(root.querySelectorAll('*'));
  console.log(`${indent}Checking ${allElements.length} elements for shadow roots...`);
  let shadowRootsFound = 0;
  for (const element of allElements) {
    if (element.shadowRoot) {
      shadowRootsFound++;
      console.log(`${indent}Found shadow root in:`, element.tagName, element.id || element.className);
      const found = window.IframeFinder.findInShadowRoots(element.shadowRoot, iframeSelectors, depth + 1);
      if (found) return found;
    }
  }
  console.log(`${indent}Found ${shadowRootsFound} shadow roots at this level`);
  return null;
};

/**
 * Find iframe containing ServiceNow form in DOM (including shadow DOM)
 * @param {number} timeout - Timeout in milliseconds (default: 15000)
 * @returns {Promise<HTMLIFrameElement>} The found iframe
 */
window.IframeFinder.findIframeInDOM = async function(timeout = 15000) {
  const startTime = Date.now();

  // List of all possible iframe selectors for ServiceNow
  const iframeSelectors = [
    'iframe#gsft_main',
    'iframe[name="gsft_main"]',
    'iframe[id*="gsft"]',
    'iframe[name*="gsft"]',
    'iframe[title*="Main"]',
    'iframe[title*="Content"]',
    'iframe[src*="incident"]',
    'iframe[src*="sys_id"]',
    'iframe' // fallback: any iframe
  ];

  // Polling loop to search for iframe
  while (Date.now() - startTime < timeout) {
    console.log('=== SEARCHING FOR IFRAME ===');
    // Search regular DOM and shadow DOM
    console.log('Searching regular DOM...');
    const iframe = window.IframeFinder.findInShadowRoots(document, iframeSelectors);
    if (iframe) {
      console.log('✓ Found iframe!');
      return iframe;
    }

    // Log all iframes on page for debugging
    const allIframes = document.querySelectorAll('iframe');
    console.log('All iframes on page:', allIframes.length);
    allIframes.forEach((frame, idx) => {
      console.log(` Iframe ${idx}:`, {
        id: frame.id,
        name: frame.name,
        src: frame.src?.substring(0, 100),
        title: frame.title,
        className: frame.className
      });
    });

    console.log('Iframe not found yet, retrying in 500ms...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.error('✗ TIMEOUT: Could not find iframe after', timeout, 'ms');
  throw new Error('Timeout: iframe not found after searching both regular and shadow DOM');
};

/**
 * Wait for iframe content to load
 * @param {HTMLIFrameElement} iframe - The iframe element
 * @returns {Promise<Document>} The iframe's document when ready
 */
window.IframeFinder.waitForIframeLoad = async function(iframe) {
  return new Promise((resolve, reject) => {
    function checkReady() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) {
          console.log('Cannot access iframe document yet, waiting...');
          return setTimeout(checkReady, 500);
        }
        if (doc.readyState !== 'complete') {
          console.log('Iframe document not ready (readyState:', doc.readyState + '), waiting...');
          return setTimeout(checkReady, 500);
        }
        console.log('✓ Iframe loaded and ready');
        resolve(doc);
      } catch (error) {
        console.error('Error accessing iframe:', error);
        reject(new Error('Cannot access iframe: ' + error.message));
      }
    }

    // Check immediately
    checkReady();

    // Also listen for load event
    iframe.addEventListener('load', checkReady);
    // Timeout fallback
    setTimeout(checkReady, 1000);
  });
};

