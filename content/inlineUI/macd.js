(function() {
  'use strict';

  const {
    MACD_BUTTON_ID,
    MACD_TEXT_REGEX,
    STATE_ASSIGNED_TEXT,
    ASSIGNMENT_GROUP_VALUE,
    TASK_TARGET,
    MACD_CHECK_DEBOUNCE
  } = window.inlineUI.constants;
  const { getDocumentContexts } = window.inlineUI.contexts;

  let macdButtonInjected = false;
  let macdCheckTimer = null;

  function isTaskPage() {
    const params = new URLSearchParams(window.location.search);
    return params.get('sysparm_record_target') === TASK_TARGET;
  }

  function pageHasMacdText() {
    return getDocumentContexts().some(ctx => {
      const bodyText = ctx.body?.innerText || '';
      return MACD_TEXT_REGEX.test(bodyText);
    });
  }

  function findFieldByLabelText(labelText) {
    const contexts = getDocumentContexts();
    const lower = labelText.toLowerCase();
    for (const ctx of contexts) {
      const labels = Array.from(ctx.querySelectorAll('label'));
      const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes(lower));
      if (!label) continue;

      if (label.htmlFor) {
        const direct = ctx.getElementById(label.htmlFor);
        const displayField = ctx.getElementById(`sys_display.${label.htmlFor}`);
        if (displayField) return displayField;
        if (direct) return direct;
      }

      const container = label.closest('.form-group, tr, td, .sn-form-field') || label.parentElement;
      if (!container) continue;
      const field = container.querySelector('input, select, textarea');
      if (field) return field;
    }
    return null;
  }

  function dispatchValueEvents(element) {
    ['input', 'change', 'blur'].forEach(type => {
      element.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  function setStateAssigned() {
    const stateField = findFieldByLabelText('State');
    if (!stateField) {
      console.warn('MACD helper: State field not found');
      return;
    }

    if (stateField.tagName === 'SELECT') {
      const options = Array.from(stateField.options);
      const targetOption = options.find(opt => (opt.textContent || '').trim().toLowerCase() === STATE_ASSIGNED_TEXT.toLowerCase());
      if (targetOption) {
        stateField.value = targetOption.value;
      } else {
        stateField.value = STATE_ASSIGNED_TEXT;
      }
    } else {
      stateField.value = STATE_ASSIGNED_TEXT;
    }

    dispatchValueEvents(stateField);
  }

  function setAssignmentGroup() {
    const assignmentField = findFieldByLabelText('Assignment group');
    if (!assignmentField) {
      console.warn('MACD helper: Assignment Group field not found');
      return;
    }

    assignmentField.value = ASSIGNMENT_GROUP_VALUE;
    dispatchValueEvents(assignmentField);

    const hiddenId = assignmentField.id?.replace('sys_display.', '');
    if (hiddenId) {
      const targetDoc = assignmentField.ownerDocument || document;
      const hiddenField = targetDoc.getElementById(hiddenId);
      if (hiddenField) {
        hiddenField.value = '';
        dispatchValueEvents(hiddenField);
      }
    }
  }

  function removeMacdButton() {
    getDocumentContexts().forEach(ctx => {
      const existing = ctx.getElementById(MACD_BUTTON_ID);
      if (existing) {
        existing.remove();
      }
    });
    macdButtonInjected = false;
  }

  function placeMacdButton(button, assignmentField) {
    const formGroup = assignmentField.closest('.form-group');
    const addons = formGroup?.querySelector('.form-field-addons');
    if (addons) {
      addons.appendChild(button);
      return;
    }

    const container = assignmentField.closest('.ref-container, .input-group, .sn-form-field, td') || assignmentField.parentElement;
    if (container) {
      container.appendChild(button);
      return;
    }

    assignmentField.insertAdjacentElement('afterend', button);
  }

  function handleMacdClick() {
    try {
      setStateAssigned();
      setAssignmentGroup();
    } catch (error) {
      console.error('MACD helper error:', error);
    }
  }

  function ensureMacdButton() {
    if (!isTaskPage() || !pageHasMacdText()) {
      removeMacdButton();
      return;
    }

    const assignmentField = findFieldByLabelText('Assignment group');
    if (!assignmentField) {
      return;
    }

    const doc = assignmentField.ownerDocument || document;
    const existing = doc.getElementById(MACD_BUTTON_ID);
    if (existing) {
      placeMacdButton(existing, assignmentField);
      macdButtonInjected = true;
      return;
    }

    const button = doc.createElement('button');
    button.id = MACD_BUTTON_ID;
    button.type = 'button';
    button.textContent = 'MACD';
    button.style.marginLeft = '8px';
    button.style.padding = '4px 8px';
    button.style.background = '#005eb8';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', handleMacdClick);

    placeMacdButton(button, assignmentField);
    macdButtonInjected = true;
  }

  function debouncedMacdCheck() {
    if (macdCheckTimer) {
      clearTimeout(macdCheckTimer);
    }
    macdCheckTimer = setTimeout(() => {
      macdCheckTimer = null;
      ensureMacdButton();
    }, MACD_CHECK_DEBOUNCE);
  }

  window.inlineUI.macd = {
    ensureMacdButton,
    debouncedMacdCheck,
    resetMacdButtonInjectionState: () => { macdButtonInjected = false; },
    removeMacdButton
  };
})();

