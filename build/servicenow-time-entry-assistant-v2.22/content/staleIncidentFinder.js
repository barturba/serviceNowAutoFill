/**
 * Stale Incident Finder
 * Scans "My Incidents KA" widget and returns incidents not updated today
 */

/**
 * Check if a UTC timestamp is from before today (in user's local timezone)
 * @param {string} utcTimestamp - UTC timestamp in format "YYYY-MM-DD HH:MM:SS"
 * @returns {boolean} - true if the date is before today
 */
function isBeforeToday(utcTimestamp) {
  if (!utcTimestamp) return false;
  
  // Parse UTC timestamp (format: "2025-12-12 04:26:56")
  const [datePart] = utcTimestamp.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  
  // Create date from UTC components
  const incidentDate = new Date(Date.UTC(year, month - 1, day));
  
  // Get today's date at midnight in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Compare dates (incident date should be before today's midnight)
  return incidentDate < today;
}

/**
 * Find the My Incidents KA widget on the page
 * @returns {Element|null} - The widget element or null if not found
 */
function findMyIncidentsWidget() {
  // Try to find by aria-label first
  const byAriaLabel = document.querySelector('[aria-label="My Incidents KA Widget"]');
  if (byAriaLabel) return byAriaLabel;
  
  // Try to find by title content
  const titleElements = document.querySelectorAll('.title-content, .grid-widget-header-title');
  for (const el of titleElements) {
    if (el.textContent?.trim() === 'My Incidents KA') {
      // Navigate up to find the widget container
      let parent = el.closest('.grid-stack-item');
      if (parent) return parent;
    }
  }
  
  return null;
}

/**
 * Extract stale incident URLs from the My Incidents KA widget
 * @returns {Object} - Result object with urls array and count information
 */
function findStaleIncidents() {
  const widget = findMyIncidentsWidget();
  
  if (!widget) {
    return {
      success: false,
      error: 'Could not find "My Incidents KA" widget on this page',
      urls: [],
      totalCount: 0,
      staleCount: 0
    };
  }
  
  // Find all incident rows in the widget
  const rows = widget.querySelectorAll('tr[data-updated-on]');
  
  if (rows.length === 0) {
    return {
      success: false,
      error: 'No incidents found in the widget',
      urls: [],
      totalCount: 0,
      staleCount: 0
    };
  }
  
  const staleUrls = [];
  const baseUrl = window.location.origin;
  
  for (const row of rows) {
    const updatedOn = row.getAttribute('data-updated-on');
    
    if (isBeforeToday(updatedOn)) {
      // Find the incident link in this row
      const link = row.querySelector('a.linked.formlink');
      if (link && link.href) {
        // Ensure we have an absolute URL
        const url = link.href.startsWith('http') 
          ? link.href 
          : baseUrl + (link.href.startsWith('/') ? '' : '/') + link.href;
        
        staleUrls.push({
          url: url,
          number: link.textContent?.trim() || 'Unknown',
          updatedOn: updatedOn
        });
      }
    }
  }
  
  return {
    success: true,
    urls: staleUrls,
    totalCount: rows.length,
    staleCount: staleUrls.length
  };
}

// Make function available globally
window.findStaleIncidents = findStaleIncidents;

