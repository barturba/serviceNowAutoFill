/**
 * Button helper utilities
 */

let isOperationInProgress = false;

function debounce(fn, delay = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

async function executeWithProgressTracking(operation, button) {
  if (isOperationInProgress) {
    console.log('Operation already in progress, ignoring click');
    return;
  }
  
  try {
    isOperationInProgress = true;
    if (button) setButtonLoading(button, true);
    await operation();
  } finally {
    if (button) setButtonLoading(button, false);
    setTimeout(() => { isOperationInProgress = false; }, 100);
  }
}

