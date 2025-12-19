/**
 * Popup message utilities
 */

function createDismissButton(onClick) {
  const btn = document.createElement('button');
  btn.className = 'message-dismiss';
  btn.innerHTML = '×';
  btn.onclick = onClick;
  return btn;
}

function hideError() {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.classList.remove('show');
    setTimeout(() => { errorElement.style.display = 'none'; }, 300);
  }
}

function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    const existingDismiss = errorElement.querySelector('.message-dismiss');
    if (existingDismiss) existingDismiss.remove();

    errorElement.textContent = message;
    errorElement.appendChild(createDismissButton(() => hideError()));
    errorElement.setAttribute('aria-label', 'Dismiss error message');
    errorElement.style.display = 'block';
    errorElement.classList.add('show');
    setTimeout(() => hideError(), 8000);
  } else {
    console.error('Error:', message);
  }
}

function hideSuccess() {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.classList.remove('show');
    setTimeout(() => { successElement.style.display = 'none'; }, 300);
  }
}

function showSuccess(message) {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    const existingDismiss = successElement.querySelector('.message-dismiss');
    if (existingDismiss) existingDismiss.remove();

    successElement.textContent = message;
    successElement.appendChild(createDismissButton(() => hideSuccess()));
    successElement.setAttribute('aria-label', 'Dismiss success message');
    successElement.style.display = 'block';
    successElement.classList.add('show');
    setTimeout(() => hideSuccess(), 3000);
  }
}

function clearMessages() {
  hideError();
  hideSuccess();
}

