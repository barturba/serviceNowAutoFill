/**
 * Stale Incident Opener
 * Opens stale incidents in new tabs sequentially, waiting for each to load
 */

const STALE_INCIDENT_FINDER_FILE = 'content/staleIncidentFinder.js';
const TAB_LOAD_TIMEOUT = 60000; // 60 seconds timeout per tab (ServiceNow can be slow)

/**
 * Update the progress display
 * @param {string} message - Progress message to display
 * @param {boolean} active - Whether to show active styling
 */
function updateStaleProgress(message, active = true) {
  const progressEl = document.getElementById('stale-incidents-progress');
  if (progressEl) {
    progressEl.textContent = message;
    progressEl.classList.toggle('active', active);
  }
}

/**
 * Clear the progress display
 */
function clearStaleProgress() {
  updateStaleProgress('', false);
}

/**
 * Wait for a tab to finish loading
 * @param {number} tabId - The tab ID to wait for
 * @returns {Promise<void>}
 */
function waitForTabLoad(tabId) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      // Don't reject, just resolve - tab might be usable even if not fully complete
      resolve();
    }, TAB_LOAD_TIMEOUT);

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(listener);
        // Add a small delay after complete to ensure page is interactive
        setTimeout(resolve, 500);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

/**
 * Open a single tab and wait for it to load
 * @param {string} url - The URL to open
 * @returns {Promise<chrome.tabs.Tab>}
 */
async function openTabAndWait(url) {
  const tab = await chrome.tabs.create({ url, active: false });
  await waitForTabLoad(tab.id);
  return tab;
}

/**
 * Open stale incidents sequentially
 * @param {Array} incidents - Array of incident objects with url property
 * @returns {Promise<Object>} - Result object with opened count
 */
async function openStaleIncidentsSequentially(incidents) {
  const total = incidents.length;
  let opened = 0;
  
  for (const incident of incidents) {
    opened++;
    updateStaleProgress(`Opening ${opened}/${total}: ${incident.number}...`);
    
    try {
      await openTabAndWait(incident.url);
    } catch (error) {
      console.error(`Failed to open ${incident.number}:`, error);
      // Continue with next incident even if one fails
    }
  }
  
  return { opened, total };
}

/**
 * Main function to find and open stale incidents
 * Called from the button handler
 */
async function handleOpenStaleIncidents() {
  clearError();
  clearStaleProgress();
  
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showError('Could not get current tab');
      return;
    }
    
    updateStaleProgress('Scanning for stale incidents...');
    
    // Inject the finder script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [STALE_INCIDENT_FINDER_FILE]
    });
    
    // Execute the finder function
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.findStaleIncidents()
    });
    
    if (!results || !results[0] || !results[0].result) {
      showError('Failed to scan page for incidents');
      clearStaleProgress();
      return;
    }
    
    const result = results[0].result;
    
    if (!result.success) {
      showError(result.error || 'Failed to find incidents');
      clearStaleProgress();
      return;
    }
    
    if (result.staleCount === 0) {
      updateStaleProgress(`All ${result.totalCount} incidents are up to date!`, false);
      showSuccess('No stale incidents to open');
      return;
    }
    
    // Open the stale incidents
    updateStaleProgress(`Found ${result.staleCount} stale incidents. Opening...`);
    
    const openResult = await openStaleIncidentsSequentially(result.urls);
    
    updateStaleProgress(`Opened ${openResult.opened}/${openResult.total} incidents`, false);
    showSuccess(`Successfully opened ${openResult.opened} stale incidents!`);
    
  } catch (error) {
    console.error('Error opening stale incidents:', error);
    showError(error.message || 'Failed to open stale incidents');
    clearStaleProgress();
  }
}

