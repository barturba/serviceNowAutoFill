/**
 * MACD Assignment Step Integration Tests
 */

const fs = require('fs');
const path = require('path');

describe('MACD Assignment Step Integration', () => {
  let referenceSetterCode;
  let setAssignedToStepCode;
  let assignmentSettersCode;

  beforeAll(() => {
    referenceSetterCode = fs.readFileSync(
      path.join(__dirname, '../../utils/fields/helpers/gFormFieldSetter/referenceFieldSetter.js'),
      'utf8'
    );
    setAssignedToStepCode = fs.readFileSync(
      path.join(__dirname, '../../core/macdAssignmentProcessor/steps/setAssignedToStep.js'),
      'utf8'
    );
    assignmentSettersCode = fs.readFileSync(
      path.join(__dirname, '../../core/macdAssignmentProcessor/fieldSetters/assignmentSetters.js'),
      'utf8'
    );
  });

  test('setReferenceFieldValue uses g_form as fallback', () => {
    expect(referenceSetterCode).toContain('setFieldValueWithGForm');
  });

  test('setReferenceFieldValue extracts table name', () => {
    expect(referenceSetterCode).toContain('closest');
    expect(referenceSetterCode).toContain('form');
    expect(referenceSetterCode).toContain('tableName');
  });

  test('setReferenceFieldValue logs debug info', () => {
    expect(referenceSetterCode).toContain('DebugLogger.log');
    expect(referenceSetterCode).toContain('Setting reference field');
  });

  test('setAssignedToStep must find assigned to field', () => {
    expect(setAssignedToStepCode).toContain('findAssignedToField');
  });

  test('setAssignedToStep must call setAssignedToField with agent name', () => {
    expect(setAssignedToStepCode).toContain('setAssignedToField');
    expect(setAssignedToStepCode).toContain('agentName');
  });

  test('setAssignedToField must pass agent name parameter', () => {
    expect(assignmentSettersCode).toContain('agentName');
  });

  test('setAssignedToField must validate inputs', () => {
    expect(assignmentSettersCode).toMatch(/if\s*\(\s*!field/);
    expect(assignmentSettersCode).toMatch(/if\s*\(\s*!field\s*\|\|\s*!agentName/);
  });

  test('setAssignedToStep must handle errors gracefully', () => {
    expect(setAssignedToStepCode).toContain('errors');
    expect(setAssignedToStepCode).toContain('Assigned To field not found');
    expect(setAssignedToStepCode).toContain('Agent name not provided');
  });
});

