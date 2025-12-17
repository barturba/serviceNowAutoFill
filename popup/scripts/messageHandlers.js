/**
 * Message display handlers for popup UI
 */

function createDismissButton(onClick) {
  const btn = document.createElement('button');
  btn.className = 'message-dismiss';
  btn.innerHTML = '×';
  btn.onclick = onClick;
  return btn;
}

function clearError() {
  // hideError and hideSuccess are defined in separate handler files
  // that are loaded before this file (see popup.html)
  if (typeof hideError === 'function') {
    hideError();
  }
  if (typeof hideSuccess === 'function') {
    hideSuccess();
  }
}


