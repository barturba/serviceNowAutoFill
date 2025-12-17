/**
 * Button Functionality Tests
 * Tests to ensure all button handlers are properly registered and functional
 */

const fs = require('fs');
const path = require('path');

describe('Button Handler Setup - Critical Regression Tests', () => {
  let setupHandlersCode;

  beforeAll(() => {
    setupHandlersCode = fs.readFileSync(
      path.join(__dirname, '../popup/scripts/buttonHandlers/setupHandlers.js'),
      'utf8'
    );
  });

  test('CRITICAL: setupButtonHandlers function must exist in source code', () => {
    // This test prevents the exact bug that broke the extension
    expect(setupHandlersCode).toContain('function setupButtonHandlers()');
  });

  test('setupButtonHandlers must call setupTimeButtonHandler', () => {
    expect(setupHandlersCode).toContain('setupTimeButtonHandler');
    expect(setupHandlersCode).toMatch(/\.time-btn.*forEach.*setupTimeButtonHandler/);
  });

  test('setupButtonHandlers must call setupTimeSaveButtonHandler', () => {
    expect(setupHandlersCode).toContain('setupTimeSaveButtonHandler');
    expect(setupHandlersCode).toMatch(/\.time-save-btn.*forEach.*setupTimeSaveButtonHandler/);
  });

  test('setupButtonHandlers must call setupAlertClearedButtonHandler', () => {
    expect(setupHandlersCode).toContain('setupAlertClearedButtonHandler');
    expect(setupHandlersCode).toMatch(/\.alert-cleared-btn.*forEach.*setupAlertClearedButtonHandler/);
  });


  test('all individual handler functions must exist', () => {
    const requiredFunctions = [
      'function setupTimeButtonHandler(',
      'function setupTimeSaveButtonHandler(',
      'function setupAlertClearedButtonHandler('
    ];

    requiredFunctions.forEach(funcSignature => {
      expect(setupHandlersCode).toContain(funcSignature);
    });
  });

  test('time button handlers should call injectAndExecute with fillTimeInNestedFrame', () => {
    expect(setupHandlersCode).toContain('fillTimeInNestedFrame');
    expect(setupHandlersCode).toContain('injectAndExecute');
  });

  test('time-save button handlers should call fillTimeInNestedFrameAndSave', () => {
    expect(setupHandlersCode).toContain('fillTimeInNestedFrameAndSave');
  });
});

describe('popup.js Integration', () => {
  let popupCode;

  beforeAll(() => {
    popupCode = fs.readFileSync(
      path.join(__dirname, '../popup/scripts/popup.js'),
      'utf8'
    );
  });

  test('CRITICAL: popup.js must call setupButtonHandlers', () => {
    // This ensures the orchestrator is actually invoked
    expect(popupCode).toContain('setupButtonHandlers()');
  });
});

describe('HTML Integration', () => {
  let popupHtml;

  beforeAll(() => {
    popupHtml = fs.readFileSync(
      path.join(__dirname, '../popup/popup.html'),
      'utf8'
    );
  });

  test('popup.html must load setupHandlers.js before popup.js', () => {
    const setupHandlersIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js');
    const popupJsIndex = popupHtml.indexOf('scripts/popup.js');
    
    expect(setupHandlersIndex).toBeGreaterThan(-1);
    expect(popupJsIndex).toBeGreaterThan(-1);
    expect(setupHandlersIndex).toBeLessThan(popupJsIndex);
  });

  test('popup.html must have all required button types', () => {
    expect(popupHtml).toContain('time-btn');
    expect(popupHtml).toContain('time-save-btn');
    expect(popupHtml).toContain('alert-cleared-btn');
  });

  test('popup.html must have comment input field', () => {
    expect(popupHtml).toContain('id="additional-comments-input"');
  });
});
