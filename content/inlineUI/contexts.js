(function() {
  'use strict';

  const {
    TIME_WORKED_SELECTORS,
    RETRY_DELAY,
    MAX_RETRIES,
    MAIN_IFRAME_SELECTOR
  } = window.inlineUI.constants;

  function getRecordTarget() {
    const topParams = new URLSearchParams(window.location.search);
    const topTarget = topParams.get('sysparm_record_target');
    if (topTarget) return topTarget;

    const frame = document.querySelector(MAIN_IFRAME_SELECTOR);
    const src = frame?.getAttribute('src') || frame?.contentWindow?.location?.search;
    if (src) {
      const qs = src.includes('?') ? src.split('?')[1] : src;
      const params = new URLSearchParams(qs);
      return params.get('sysparm_record_target');
    }
    return null;
  }

  function getDocumentContexts() {
    const contexts = [document];
    const frames = Array.from(document.querySelectorAll('iframe'));
    frames.forEach(frame => {
      try {
        if (frame.contentDocument) {
          contexts.push(frame.contentDocument);
        }
      } catch (e) {
        // cross-origin; skip
      }
    });
    const mainFrame = document.querySelector(MAIN_IFRAME_SELECTOR);
    if (mainFrame && mainFrame.contentDocument && !contexts.includes(mainFrame.contentDocument)) {
      contexts.push(mainFrame.contentDocument);
    }
    return contexts;
  }

  function findTimeWorkedElement() {
    const target = getRecordTarget();
    const contexts = getDocumentContexts();

    const ordered = [...contexts];
    if (target === 'incident') {
      const frameDoc = document.querySelector(MAIN_IFRAME_SELECTOR)?.contentDocument;
      if (frameDoc && !ordered.includes(frameDoc)) {
        ordered.unshift(frameDoc);
      }
    }

    for (const ctx of ordered) {
      for (const selector of TIME_WORKED_SELECTORS) {
        const el = ctx.querySelector(selector);
        if (el) {
          const container = el.closest('.form-group') || el.parentElement;
          return { element: container || el, doc: ctx };
        }
      }

      const labels = Array.from(ctx.querySelectorAll('label'));
      const label = labels.find(l => (l.textContent || '').trim().toLowerCase().includes('time worked'));
      if (label) {
        const container = label.closest('.form-group') || label.parentElement;
        if (container) return { element: container, doc: ctx };
      }
    }

    return null;
  }

  async function waitForTimeWorkedField(retries = 0) {
    const result = findTimeWorkedElement();
    if (result) {
      return result;
    }

    if (retries >= MAX_RETRIES) {
      console.log('ServiceNow Time Assistant: Time Worked field not found after max retries');
      return null;
    }

    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return waitForTimeWorkedField(retries + 1);
  }

  window.inlineUI.contexts = {
    getRecordTarget,
    getDocumentContexts,
    findTimeWorkedElement,
    waitForTimeWorkedField
  };
})();

