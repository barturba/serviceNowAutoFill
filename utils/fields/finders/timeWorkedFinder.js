/**
 * Find time_worked container and inputs
 * @param {Document} doc - Document to search
 * @returns {Promise<{container: HTMLElement, hourInput: HTMLElement, minInput: HTMLElement, secInput: HTMLElement, hiddenTime: HTMLElement}>}
 */
window.FieldFinder.findTimeWorkedFields = async function(doc) {
  try {
    const timeContainer = await findTimeWorkedContainer(doc);
    const { hourInput, minInput, secInput } = extractTimeInputs(timeContainer);
    const hiddenTime = findHiddenTimeField(doc);

    return { container: timeContainer, hourInput, minInput, secInput, hiddenTime };
  } catch (error) {
    window.FieldFinder.captureException(error, { finder: 'time_worked' });
    throw error;
  }
};

async function findTimeWorkedContainer(doc) {
  const immediate = doc.querySelector('[id*="time_worked"]');
  if (immediate) {
    const normalized = normalizeTimeContainer(immediate);
    window.FieldFinder.logDebug('Found time container immediately:', normalized?.id);
    return normalized;
  }

  window.FieldFinder.logDebug('time_worked not immediately found, waiting...');
  const awaited = await window.FieldFinder.waitForElement(
    doc,
    'input[id*="time_worked"], div[id*="time_worked"]'
  );
  const normalized = normalizeTimeContainer(awaited);
  window.FieldFinder.logDebug('Found time container after wait:', normalized?.id);
  return normalized;
}

function normalizeTimeContainer(container) {
  if (!container) {
    throw new Error('time_worked container not found');
  }

  if (container.tagName === 'INPUT') {
    return container.closest('div[id*="time_worked"]') || container.parentElement || container;
  }

  return container;
}

function extractTimeInputs(timeContainer) {
  const timeInputs = timeContainer.querySelectorAll('input.form-control');
  window.FieldFinder.logDebug('Found time inputs:', timeInputs.length);

  if (timeInputs.length < 3) {
    throw new Error(`Expected 3 time inputs, found ${timeInputs.length}`);
  }

  const [hourInput, minInput, secInput] = timeInputs;
  return { hourInput, minInput, secInput };
}

function findHiddenTimeField(doc) {
  const hiddenTime =
    doc.querySelector('[id$="time_worked"]') ||
    doc.querySelector('input[name*="time_worked"]');

  if (!hiddenTime) {
    throw new Error('Hidden time field not found');
  }

  window.FieldFinder.logDebug('Found hidden time:', hiddenTime.id);
  return hiddenTime;
}
