/**
 * Error message handlers
 */

function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    const existingDismiss = errorElement.querySelector('.message-dismiss');
    if (existingDismiss) existingDismiss.remove();
    
    errorElement.textContent = message;
    errorElement.appendChild(createDismissButton(() => hideError()));
    errorElement.setAttribute('aria-label', 'Dismiss error message');
    errorElement.classList.add('show');
    setTimeout(() => hideError(), 8000);
  } else {
    console.error('Error:', message);
  }
}

function hideError() {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.classList.remove('show');
    setTimeout(() => { errorElement.style.display = 'none'; }, 300);
  }
}

