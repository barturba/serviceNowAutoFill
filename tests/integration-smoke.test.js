/**
 * Integration Smoke Tests
 * End-to-end tests to verify critical functionality works
 */

const fs = require('fs');
const path = require('path');

describe('Extension Popup Integration', () => {
  let popupHtml;

  beforeAll(() => {
    popupHtml = fs.readFileSync(
      path.join(__dirname, '../popup/popup.html'),
      'utf8'
    );
  });

  test('popup HTML should load successfully', () => {
    expect(popupHtml).toBeDefined();
    expect(popupHtml.length).toBeGreaterThan(0);
  });

  test('all required time buttons should exist', () => {
    const timeButtonMatches = popupHtml.match(/class="time-btn"/g);
    expect(timeButtonMatches).not.toBeNull();
    expect(timeButtonMatches.length).toBe(6); // 15min, 30min, 45min, 1hr, 1.5hr, 2hr
  });

  test('all required time-save buttons should exist', () => {
    const timeSaveButtonMatches = popupHtml.match(/class="time-save-btn"/g);
    expect(timeSaveButtonMatches).not.toBeNull();
    expect(timeSaveButtonMatches.length).toBe(6);
  });

  test('alert cleared button should exist', () => {
    expect(popupHtml).toContain('alert-cleared-btn');
  });

  test('MACD assignment button should exist', () => {
    expect(popupHtml).toContain('macd-assignment-btn');
  });

  test('open stale incidents button should exist', () => {
    expect(popupHtml).toContain('open-stale-incidents-btn');
  });

  test('agent input dropdown should exist', () => {
    expect(popupHtml).toContain('id="taskmaster-agent-input"');
  });

  test('comment input field should exist', () => {
    expect(popupHtml).toContain('id="additional-comments-input"');
  });
});

describe('Script Loading Order', () => {
  let popupHtml;

  beforeAll(() => {
    popupHtml = fs.readFileSync(
      path.join(__dirname, '../popup/popup.html'),
      'utf8'
    );
  });

  test('setupHandlers.js must load before popup.js', () => {
    const setupHandlersIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js');
    const popupJsIndex = popupHtml.indexOf('scripts/popup.js');
    
    expect(setupHandlersIndex).toBeGreaterThan(-1);
    expect(popupJsIndex).toBeGreaterThan(-1);
    expect(setupHandlersIndex).toBeLessThan(popupJsIndex);
  });

  test('helpers must load before buttonHandlers', () => {
    const helpersIndex = popupHtml.indexOf('scripts/helpers.js');
    const buttonHandlersIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js');
    
    expect(helpersIndex).toBeGreaterThan(-1);
    expect(buttonHandlersIndex).toBeGreaterThan(-1);
    expect(helpersIndex).toBeLessThan(buttonHandlersIndex);
  });

  test('injectionHelpers must load before buttonHandlers', () => {
    const injectionHelpersIndex = popupHtml.indexOf('scripts/injectionHelpers.js');
    const buttonHandlersIndex = popupHtml.indexOf('buttonHandlers/setupHandlers.js');
    
    expect(injectionHelpersIndex).toBeGreaterThan(-1);
    expect(buttonHandlersIndex).toBeGreaterThan(-1);
    expect(injectionHelpersIndex).toBeLessThan(buttonHandlersIndex);
  });
});

describe('Popup.js Integration', () => {
  let popupJsCode;

  beforeAll(() => {
    popupJsCode = fs.readFileSync(
      path.join(__dirname, '../popup/scripts/popup.js'),
      'utf8'
    );
  });

  test('CRITICAL: popup.js must call setupButtonHandlers()', () => {
    // This is the critical call that was working before
    expect(popupJsCode).toContain('setupButtonHandlers()');
  });

  test('popup.js must initialize agent dropdown', () => {
    expect(popupJsCode).toContain('initializeAgentDropdown');
  });

  test('popup.js must setup agent event handlers', () => {
    expect(popupJsCode).toContain('setupAgentEventHandlers');
  });
});

describe('Regression Prevention Tests', () => {
  let setupHandlersCode;

  beforeAll(() => {
    setupHandlersCode = fs.readFileSync(
      path.join(__dirname, '../popup/scripts/buttonHandlers/setupHandlers.js'),
      'utf8'
    );
  });

  test('CRITICAL: setupButtonHandlers function must exist', () => {
    // This test specifically prevents regression of commit 8ad02ee bug
    // where setupButtonHandlers was deleted during refactoring
    expect(setupHandlersCode).toContain('function setupButtonHandlers()');
  });

  test('CRITICAL: setupButtonHandlers must register all button types', () => {
    // Ensures all button types are wired up
    expect(setupHandlersCode).toContain("querySelectorAll('.time-btn')");
    expect(setupHandlersCode).toContain("querySelectorAll('.time-save-btn')");
    expect(setupHandlersCode).toContain("querySelectorAll('.alert-cleared-btn')");
    expect(setupHandlersCode).toContain("querySelectorAll('.macd-assignment-btn')");
    expect(setupHandlersCode).toContain("querySelectorAll('.open-stale-incidents-btn')");
  });

  test('CRITICAL: all individual setup functions must exist', () => {
    const requiredFunctions = [
      'setupTimeButtonHandler',
      'setupTimeSaveButtonHandler',
      'setupAlertClearedButtonHandler',
      'setupMacdAssignmentButtonHandler',
      'setupOpenStaleIncidentsButtonHandler'
    ];

    requiredFunctions.forEach(funcName => {
      expect(setupHandlersCode).toContain(`function ${funcName}(`);
    });
  });
});

describe('Reference Field Fix Verification', () => {
  let gFormFieldSetterCode;

  beforeAll(() => {
    gFormFieldSetterCode = fs.readFileSync(
      path.join(__dirname, '../utils/fields/helpers/gFormFieldSetter.js'),
      'utf8'
    );
  });

  test('CRITICAL: setReferenceFieldValue must target display field', () => {
    // This is the fix for MACD assignment
    expect(gFormFieldSetterCode).toContain('sys_display');
    expect(gFormFieldSetterCode).toMatch(/sys_display\.\$\{.*\}\.\$\{.*\}/);
  });

  test('setReferenceFieldValue must trigger autocomplete', () => {
    expect(gFormFieldSetterCode).toContain('dispatchEvent');
    expect(gFormFieldSetterCode).toContain('focus');
    expect(gFormFieldSetterCode).toContain('input');
    expect(gFormFieldSetterCode).toContain('blur');
  });

  test('setReferenceFieldValue must wait for autocomplete processing', () => {
    // Must have delay to let autocomplete work
    expect(gFormFieldSetterCode).toMatch(/delay\s*\(\s*[0-9]+/);
  });
});
