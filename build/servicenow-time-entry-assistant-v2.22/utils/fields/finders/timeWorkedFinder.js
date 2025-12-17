/**
 * Find time_worked container and inputs
 * @param {Document} doc - Document to search
 * @returns {Promise<{container: HTMLElement, hourInput: HTMLElement, minInput: HTMLElement, secInput: HTMLElement, hiddenTime: HTMLElement}>}
 */
window.FieldFinder.findTimeWorkedFields = async function(doc) {
  let timeContainer = doc.querySelector('[id*="time_worked"]');
  if (!timeContainer) {
    console.log('time_worked not immediately found, waiting...');
    timeContainer = await window.FieldFinder.waitForElement(doc, 'input[id*="time_worked"], div[id*="time_worked"]');
  }
  console.log('Found time container:', timeContainer.id);

  // Find parent div if we got an input
  if (timeContainer.tagName === 'INPUT') {
    timeContainer = timeContainer.closest('div[id*="time_worked"]') || timeContainer.parentElement;
  }

  const timeInputs = timeContainer.querySelectorAll('input.form-control');
  console.log('Found time inputs:', timeInputs.length);
  if (timeInputs.length < 3) {
    throw new Error(`Expected 3 time inputs, found ${timeInputs.length}`);
  }
  const hourInput = timeInputs[0];
  const minInput = timeInputs[1];
  const secInput = timeInputs[2];

  // Find hidden time field
  const hiddenTime = doc.querySelector('[id$="time_worked"]') ||
                    doc.querySelector('input[name*="time_worked"]');
  if (!hiddenTime) throw new Error('Hidden time field not found');
  console.log('Found hidden time:', hiddenTime.id);

  return { container: timeContainer, hourInput, minInput, secInput, hiddenTime };
};

