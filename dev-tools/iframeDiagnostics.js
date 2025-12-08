/**
 * Iframe diagnostics utilities
 */

/**
 * Find and log all iframes on the page
 */
function findAllIframes() {
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
}

// Make available globally
window.findAllIframes = findAllIframes;

