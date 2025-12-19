const fs = require('fs'); const path = require('path');
describe('Extension Popup Integration', () => {
  let popupHtml;
  beforeAll(() => { popupHtml = fs.readFileSync(path.join(__dirname, '../popup/popup.html'), 'utf8'); });
  test('popup HTML should load successfully', () => { expect(popupHtml).toBeDefined(); expect(popupHtml.length).toBeGreaterThan(0); });
  test('all required time-save buttons should exist', () => { const matches = popupHtml.match(/class="time-save-btn"/g); expect(matches).not.toBeNull(); expect(matches.length).toBe(6); });
  test('alert cleared button should exist', () => { expect(popupHtml).toContain('alert-cleared-btn'); });
  test('comment input field should exist', () => { expect(popupHtml).toContain('id="additional-comments-input"'); });
});
describe('Script Loading Order', () => {
  let popupHtml;
  beforeAll(() => { popupHtml = fs.readFileSync(path.join(__dirname, '../popup/popup.html'), 'utf8'); });
  test('setupHandlers.js must load before popup.js', () => { const setupIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js'); const popupIndex = popupHtml.indexOf('scripts/popup.js'); expect(setupIndex).toBeGreaterThan(-1); expect(popupIndex).toBeGreaterThan(-1); expect(setupIndex).toBeLessThan(popupIndex); });
  test('helpers must load before buttonHandlers', () => { const helpersIndex = popupHtml.indexOf('scripts/helpers.js'); const buttonIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js'); expect(helpersIndex).toBeGreaterThan(-1); expect(buttonIndex).toBeGreaterThan(-1); expect(helpersIndex).toBeLessThan(buttonIndex); });
  test('injectionHelpers must load before buttonHandlers', () => { const injectionIndex = popupHtml.indexOf('scripts/injectionHelpers.js'); const buttonIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js'); expect(injectionIndex).toBeGreaterThan(-1); expect(buttonIndex).toBeGreaterThan(-1); expect(injectionIndex).toBeLessThan(buttonIndex); });
});
describe('Popup.js Integration', () => {
  let popupJsCode;
  beforeAll(() => { popupJsCode = fs.readFileSync(path.join(__dirname, '../popup/scripts/popup.js'), 'utf8'); });
  test('CRITICAL: popup.js must call setupButtonHandlers()', () => { expect(popupJsCode).toContain('setupButtonHandlers()'); });
});
describe('Regression Prevention Tests', () => {
  let setupHandlersCode;
  beforeAll(() => { setupHandlersCode = fs.readFileSync(path.join(__dirname, '../popup/scripts/buttonHandlers/setupHandlers.js'), 'utf8'); });
  test('CRITICAL: setupButtonHandlers function must exist', () => { expect(setupHandlersCode).toContain('function setupButtonHandlers()'); });
  test('CRITICAL: setupButtonHandlers must register all button types', () => { expect(setupHandlersCode).toContain(\"querySelectorAll('.time-save-btn')\"); expect(setupHandlersCode).toContain(\"querySelectorAll('.alert-cleared-btn')\"); });
  test('CRITICAL: all individual setup functions must exist', () => { ['setupTimeSaveButtonHandler', 'setupAlertClearedButtonHandler'].forEach(funcName => { expect(setupHandlersCode).toContain(`function ${funcName}(`); }); });
});
describe('Reference Field Fix Verification', () => {
  let gFormFieldSetterCode;
  beforeAll(() => { gFormFieldSetterCode = fs.readFileSync(path.join(__dirname, '../utils/fields/helpers/gFormFieldSetter/referenceFieldSetter.js'), 'utf8'); });
  test('CRITICAL: setReferenceFieldValue must target display field', () => { expect(gFormFieldSetterCode).toContain('sys_display'); expect(gFormFieldSetterCode).toMatch(/sys_display\.\$\{.*\}\.\$\{.*\}/); });
  test('setReferenceFieldValue must trigger autocomplete', () => { ['dispatchEvent', 'focus', 'input', 'blur'].forEach(token => expect(gFormFieldSetterCode).toContain(token)); });
  test('setReferenceFieldValue must wait for autocomplete processing', () => { expect(gFormFieldSetterCode).toMatch(/delay\s*\(\s*[0-9]+/); });
});
