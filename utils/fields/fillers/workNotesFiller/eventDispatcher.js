/**
 * Event dispatching for work notes fields
 */

function dispatchWorkNotesEvents(workNotesField, finalWorkNotesText) {
  ['click', 'focus', 'keydown', 'keypress', 'input', 'keyup', 'change', 'blur'].forEach(type => {
    workNotesField.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  });
  workNotesField.dispatchEvent(
    new InputEvent('input', { 
      bubbles: true, 
      cancelable: true, 
      inputType: 'insertText', 
      data: finalWorkNotesText 
    })
  );
}

window.dispatchWorkNotesEvents = dispatchWorkNotesEvents;

