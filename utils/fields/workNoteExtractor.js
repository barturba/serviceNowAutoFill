/**
 * Extract work notes from activity stream
 */

/**
 * Extract the last work note from the activity stream
 * @param {Document} doc - Document to search
 * @returns {string} Work note text or default
 */
function getLastWorkNote(doc) {
  try {
    // Find all activity stream entries
    const activityEntries = doc.querySelectorAll('.h-card.h-card_md.h-card_comments');
    console.log('Found', activityEntries.length, 'activity entries');

    // Look for the first (most recent) work notes entry
    for (const entry of activityEntries) {
      // Check if this entry is a work notes entry
      const fieldLabel = entry.querySelector('.sn-card-component-time span');
      if (fieldLabel && fieldLabel.textContent.trim() === 'Work notes') {
        // Extract the text content
        const textBody = entry.querySelector('.sn-widget-textblock-body');
        if (textBody) {
          const noteText = textBody.textContent.trim();
          if (noteText) {
            console.log('Found last work note:', noteText);
            return noteText;
          }
        }
      }
    }
    console.log('No work notes found in activity stream, using default');
    return 'updating time';
  } catch (e) {
    console.log('Error extracting work note:', e.message);
    return 'updating time';
  }
}

// Make available globally
window.getLastWorkNote = getLastWorkNote;

