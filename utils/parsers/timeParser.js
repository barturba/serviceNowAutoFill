/**
 * Time parsing and formatting utilities
 */

// Use global namespace for injected scripts
window.TimeParser = window.TimeParser || {};

/**
 * Parse a duration string into seconds
 * @param {string} str - Duration string (e.g., "15 minutes", "1 hour 30 minutes")
 * @returns {number} Duration in seconds
 */
window.TimeParser.parseDuration = function(str) {
  let seconds = 0;
  const parts = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(h|hour|m|min|minute|s|sec|second)?/g) || [];
  parts.forEach(part => {
    const num = parseFloat(part);
    if (isNaN(num)) return;
    if (part.includes('h') || part.includes('hour')) seconds += num * 3600;
    else if (part.includes('m') || part.includes('min') || part.includes('minute')) seconds += num * 60;
    else if (part.includes('s') || part.includes('sec') || part.includes('second')) seconds += num;
    else seconds += num * 60;
  });
  return seconds;
};

/**
 * Format a Date object to ServiceNow format
 * @param {Date} d - Date object
 * @returns {string} Formatted date string (MM/DD/YYYY HH:mm:ss)
 */
window.TimeParser.formatDate = function(d) {
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  const secs = d.getSeconds().toString().padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${mins}:${secs}`;
};

