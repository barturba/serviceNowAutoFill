/**
 * Helper functions for popup
 */

/**
 * Get comment text from input field
 */
function getCommentText() {
  const commentInput = document.getElementById('additional-comments-input');
  return commentInput ? commentInput.value.trim() : '';
}

