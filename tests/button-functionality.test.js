const fs = require('fs'); const path = require('path');
describe('Button Handler Setup - Critical Regression Tests', () => {
  let setupHandlersCode;
  beforeAll(() => { setupHandlersCode = fs.readFileSync(path.join(__dirname, '../popup/scripts/buttonHandlers/setupHandlers.js'), 'utf8'); });
  test('CRITICAL: setupButtonHandlers function must exist in source code', () => { expect(setupHandlersCode).toContain('function setupButtonHandlers()'); });
  test('setupButtonHandlers must call setupTimeSaveButtonHandler', () => { expect(setupHandlersCode).toContain("document.querySelectorAll('.time-save-btn').forEach(setupTimeSaveButtonHandler);"); });
  test('setupButtonHandlers must call setupAlertClearedButtonHandler', () => { expect(setupHandlersCode).toContain("document.querySelectorAll('.alert-cleared-btn').forEach(setupAlertClearedButtonHandler);"); });
  test('all individual handler functions must exist', () => { ['function setupTimeSaveButtonHandler(', 'function setupAlertClearedButtonHandler('].forEach(sig => expect(setupHandlersCode).toContain(sig)); });
  test('time-save button handlers should call fillTimeInNestedFrameAndSave', () => { expect(setupHandlersCode).toContain('fillTimeInNestedFrameAndSave'); });
});
describe('popup.js Integration', () => {
  let popupCode;
  beforeAll(() => { popupCode = fs.readFileSync(path.join(__dirname, '../popup/scripts/popup.js'), 'utf8'); });
  test('CRITICAL: popup.js must call setupButtonHandlers', () => { expect(popupCode).toContain('setupButtonHandlers()'); });
});
describe('HTML Integration', () => {
  let popupHtml;
  beforeAll(() => { popupHtml = fs.readFileSync(path.join(__dirname, '../popup/popup.html'), 'utf8'); });
  test('popup.html must load setupHandlers.js before popup.js', () => { const setupIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js'); const popupIndex = popupHtml.indexOf('scripts/popup.js'); expect(setupIndex).toBeGreaterThan(-1); expect(popupIndex).toBeGreaterThan(-1); expect(setupIndex).toBeLessThan(popupIndex); });
  test('popup.html must have all required button types', () => { expect(popupHtml).toContain('time-save-btn'); expect(popupHtml).toContain('alert-cleared-btn'); });
  test('popup.html must have comment input field', () => { expect(popupHtml).toContain('id=\"additional-comments-input\"'); });
});
