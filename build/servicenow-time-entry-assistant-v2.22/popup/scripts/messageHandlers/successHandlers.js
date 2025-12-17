/**
 * Success message handlers
 */

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

function hideSuccess() {
  const successElement = document.getElementById('success-message');
  if (successElement) {
    successElement.classList.remove('show');
    setTimeout(() => { successElement.style.display = 'none'; }, 300);
  }
}

