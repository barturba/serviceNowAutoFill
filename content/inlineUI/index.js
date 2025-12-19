(function() {
  'use strict';
  const { waitForTimeWorkedField, getDocumentContexts } = window.inlineUI.contexts;
  const { createInlineUI, ensureStyles, setupEventHandlers, isUiPresent } = window.inlineUI.ui;
  const { debouncedMacdCheck } = window.inlineUI.macd;
  const { MAIN_IFRAME_SELECTOR } = window.inlineUI.constants;
  let injectedDocs = new WeakSet(); let trackedFrame = null;
  function attachFrameLoadHandler() { const frame = document.querySelector(MAIN_IFRAME_SELECTOR); if (!frame || frame === trackedFrame) return; trackedFrame = frame; frame.addEventListener('load', () => { injectedDocs = new WeakSet(); debouncedMacdCheck(); setTimeout(() => { injectUI(); }, 200); }); }
  async function injectUI() { const timeWorkedResult = await waitForTimeWorkedField(); if (!timeWorkedResult) { console.log('ServiceNow Time Assistant: Could not find Time Worked field'); return; } const { element: timeWorkedElement, doc } = timeWorkedResult; if (injectedDocs.has(doc) || isUiPresent(doc)) return; ensureStyles(doc); const inlineUI = createInlineUI(doc); timeWorkedElement.insertBefore(inlineUI, timeWorkedElement.firstChild); setupEventHandlers(doc); injectedDocs.add(doc); console.log('ServiceNow Time Assistant: Inline UI injected successfully'); }
  function init() { attachFrameLoadHandler(); if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', injectUI); document.addEventListener('DOMContentLoaded', debouncedMacdCheck); document.addEventListener('DOMContentLoaded', attachFrameLoadHandler); } else { injectUI(); debouncedMacdCheck(); attachFrameLoadHandler(); } const observer = new MutationObserver(() => { injectUI(); debouncedMacdCheck(); attachFrameLoadHandler(); }); getDocumentContexts().forEach(ctx => { if (ctx.body) observer.observe(ctx.body, { childList: true, subtree: true }); }); }
  init();
})();

