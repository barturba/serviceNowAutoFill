/**
 * Reference Field Setter Tests
 * Tests for ServiceNow autocomplete reference field handling
 */

const fs = require('fs');
const path = require('path');

describe('Reference Field Setter - Code Structure Tests', () => {
  let gFormFieldSetterCode;

  beforeAll(() => {
    gFormFieldSetterCode = fs.readFileSync(
      path.join(__dirname, '../utils/fields/helpers/gFormFieldSetter.js'),
      'utf8'
    );
  });

  test('CRITICAL: setReferenceFieldValue function must exist', () => {
    expect(gFormFieldSetterCode).toContain('async function setReferenceFieldValue(');
  });

  test('setReferenceFieldValue must handle display fields', () => {
    // This is the fix for MACD assignment issue
    expect(gFormFieldSetterCode).toContain('sys_display');
    expect(gFormFieldSetterCode).toContain('displayField');
  });

  test('setReferenceFieldValue must trigger autocomplete events', () => {
    // Must trigger the event sequence for autocomplete
    expect(gFormFieldSetterCode).toContain('dispatchEvent');
    expect(gFormFieldSetterCode).toMatch(/Event.*focus/);
    expect(gFormFieldSetterCode).toMatch(/Event.*input/);
  });

  test('setReferenceFieldValue must wait for autocomplete processing', () => {
    // Must include delays for autocomplete to process
    expect(gFormFieldSetterCode).toContain('delay');
    expect(gFormFieldSetterCode).toMatch(/delay\s*\(\s*[0-9]+/);
  });

  test('setReferenceFieldValue must trigger blur and change events', () => {
    // These finalize the autocomplete selection
    expect(gFormFieldSetterCode).toMatch(/Event.*blur/);
    expect(gFormFieldSetterCode).toMatch(/Event.*change/);
  });

  test('setReferenceFieldValue must use g_form API as fallback', () => {
    expect(gFormFieldSetterCode).toContain('setFieldValueWithGForm');
  });

  test('setReferenceFieldValue must extract table name from form', () => {
    expect(gFormFieldSetterCode).toContain('closest');
    expect(gFormFieldSetterCode).toContain('form');
    expect(gFormFieldSetterCode).toContain('tableName');
  });

  test('setReferenceFieldValue must log debug information', () => {
    expect(gFormFieldSetterCode).toContain('DebugLogger.log');
    expect(gFormFieldSetterCode).toContain('Setting reference field');
  });

  test('setReferenceFieldValue must handle missing display field', () => {
    // Should check if display field exists
    expect(gFormFieldSetterCode).toMatch(/if\s*\(\s*displayField/);
  });

  test('setFieldValueWithGForm must exist', () => {
    expect(gFormFieldSetterCode).toContain('async function setFieldValueWithGForm(');
  });

  test('setFieldValueWithGForm must use g_form.setValue', () => {
    expect(gFormFieldSetterCode).toContain('gForm.setValue');
  });

  test('setFieldValueWithGForm must clear field before setting', () => {
    // Should set to empty string first
    expect(gFormFieldSetterCode).toMatch(/setValue\s*\([^,]+,\s*['"]['"]/);;
  });
});

describe('Integration with MACD Assignment', () => {
  let assignmentSettersCode;

  beforeAll(() => {
    assignmentSettersCode = fs.readFileSync(
      path.join(__dirname, '../core/macdAssignmentProcessor/fieldSetters/assignmentSetters.js'),
      'utf8'
    );
  });

  test('setAssignedToField must call setReferenceFieldValue', () => {
    expect(assignmentSettersCode).toContain('setReferenceFieldValue');
    expect(assignmentSettersCode).toContain('assigned_to');
  });

  test('setAssignedToField must pass agent name parameter', () => {
    expect(assignmentSettersCode).toContain('agentName');
  });

  test('setAssignedToField must validate inputs', () => {
    expect(assignmentSettersCode).toMatch(/if\s*\(\s*!field/);
    // Validates both field and agentName in one conditional
    expect(assignmentSettersCode).toMatch(/if\s*\(\s*!field\s*\|\|\s*!agentName/);
  });
});

describe('MACD Assignment Step Integration', () => {
  let setAssignedToStepCode;

  beforeAll(() => {
    setAssignedToStepCode = fs.readFileSync(
      path.join(__dirname, '../core/macdAssignmentProcessor/steps/setAssignedToStep.js'),
      'utf8'
    );
  });

  test('setAssignedToStep must find assigned to field', () => {
    expect(setAssignedToStepCode).toContain('findAssignedToField');
  });

  test('setAssignedToStep must call setAssignedToField with agent name', () => {
    expect(setAssignedToStepCode).toContain('setAssignedToField');
    expect(setAssignedToStepCode).toContain('agentName');
  });

  test('setAssignedToStep must handle errors gracefully', () => {
    expect(setAssignedToStepCode).toContain('errors');
    expect(setAssignedToStepCode).toContain('Assigned To field not found');
    expect(setAssignedToStepCode).toContain('Agent name not provided');
  });
});
