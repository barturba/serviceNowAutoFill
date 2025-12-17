/**
 * MACD Assignment Integration Tests
 */

const fs = require('fs');
const path = require('path');

describe('MACD Assignment Integration', () => {
  let gFormCode;
  let assignmentSettersCode;

  beforeAll(() => {
    gFormCode = fs.readFileSync(
      path.join(__dirname, '../../utils/fields/helpers/gFormFieldSetter/basicSetter.js'),
      'utf8'
    );
    assignmentSettersCode = fs.readFileSync(
      path.join(__dirname, '../../core/macdAssignmentProcessor/fieldSetters/assignmentSetters.js'),
      'utf8'
    );
  });

  test('setFieldValueWithGForm must exist', () => {
    expect(gFormCode).toContain('async function setFieldValueWithGForm(');
  });

  test('must use g_form.setValue', () => {
    expect(gFormCode).toMatch(/gForm\.setValue/);
  });

  test('must clear field before setting', () => {
    expect(gFormCode).toMatch(/setValue\s*\(/);
  });

  test('setAssignedToField must call setReferenceFieldValue', () => {
    expect(assignmentSettersCode).toContain('setReferenceFieldValue');
    expect(assignmentSettersCode).toContain('assigned_to');
  });
});
