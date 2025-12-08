/**
 * Popup script for ServiceNow Time Entry Assistant
 * Handles button clicks and injects form filling script into ServiceNow pages
 */

// Get all time buttons and add click listeners
document.querySelectorAll('.time-btn').forEach(button => {
  button.addEventListener('click', () => {
    const timeValue = button.getAttribute('data-time');
    // Read comment text from input field
    const commentInput = document.getElementById('additional-comments-input');
    const commentText = commentInput ? commentInput.value.trim() : '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      
      // Inject all module files in order, then the main function
      chrome.scripting.executeScript({
        target: { tabId },
        files: [
          'utils/timeParser.js',
          'utils/fieldFinder.js',
          'utils/iframeFinder.js',
          'utils/formFiller.js',
          'inject.js'
        ]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert('Error: ' + chrome.runtime.lastError.message);
          return;
        }

        // Now execute the function with the time value and comment text
        chrome.scripting.executeScript({
          target: { tabId },
          func: (timeValue, commentText) => {
            // Call the function that was injected
            if (window.fillTimeInNestedFrame) {
              return window.fillTimeInNestedFrame(timeValue, commentText);
            } else {
              throw new Error('fillTimeInNestedFrame not found');
            }
          },
          args: [timeValue, commentText]
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
          } else if (results && results[0].result) {
            const result = results[0].result;
            if (result.success) {
              // Close popup on success
              window.close();
            } else {
              alert('Failed: ' + (result.error || 'Unknown error'));
            }
          } else {
            // Close popup if no results (script injected successfully)
            window.close();
          }
        });
      });
    });
  });
});

// Get all time-save buttons (green buttons) and add click listeners
document.querySelectorAll('.time-save-btn').forEach(button => {
  button.addEventListener('click', () => {
    const timeValue = button.getAttribute('data-time');
    // Read comment text from input field
    const commentInput = document.getElementById('additional-comments-input');
    const commentText = commentInput ? commentInput.value.trim() : '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      
      // Inject all module files in order, then the main function
      chrome.scripting.executeScript({
        target: { tabId },
        files: [
          'utils/timeParser.js',
          'utils/fieldFinder.js',
          'utils/iframeFinder.js',
          'utils/formFiller.js',
          'inject.js'
        ]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert('Error: ' + chrome.runtime.lastError.message);
          return;
        }

        // Now execute the function with the time value and comment text
        chrome.scripting.executeScript({
          target: { tabId },
          func: (timeValue, commentText) => {
            // Call the function that was injected
            if (window.fillTimeInNestedFrameAndSave) {
              return window.fillTimeInNestedFrameAndSave(timeValue, commentText);
            } else {
              throw new Error('fillTimeInNestedFrameAndSave not found');
            }
          },
          args: [timeValue, commentText]
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
          } else if (results && results[0].result) {
            const result = results[0].result;
            if (result.success) {
              // Close popup on success
              window.close();
            } else {
              alert('Failed: ' + (result.error || 'Unknown error'));
            }
          } else {
            // Close popup if no results (script injected successfully)
            window.close();
          }
        });
      });
    });
  });
});

// Handle alert cleared button click
document.querySelectorAll('.alert-cleared-btn').forEach(button => {
  button.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      
      // Inject all module files in order, then the main function
      chrome.scripting.executeScript({
        target: { tabId },
        files: [
          'utils/timeParser.js',
          'utils/fieldFinder.js',
          'utils/iframeFinder.js',
          'utils/formFiller.js',
          'inject.js'
        ]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          alert('Error: ' + chrome.runtime.lastError.message);
          return;
        }

        // Now execute the alert cleared function
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            // Call the function that was injected
            if (window.processAlertCleared) {
              return window.processAlertCleared();
            } else {
              throw new Error('processAlertCleared not found');
            }
          }
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error: ' + chrome.runtime.lastError.message);
          } else if (results && results[0].result) {
            const result = results[0].result;
            if (result.success) {
              // Close popup on success
              window.close();
            } else {
              alert('Failed: ' + (result.error || 'Unknown error'));
            }
          } else {
            // Close popup if no results (script injected successfully)
            window.close();
          }
        });
      });
    });
  });
});
