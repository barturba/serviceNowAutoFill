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
  hideError();
  hideSuccess();
}
