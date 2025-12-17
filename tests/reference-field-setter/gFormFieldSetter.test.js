/**
 * gFormFieldSetter Code Structure Tests
 */

const fs = require('fs');
const path = require('path');

describe('gFormFieldSetter - Code Structure', () => {
  let code;

  beforeAll(() => {
    code = fs.readFileSync(
      path.join(__dirname, '../../utils/fields/helpers/gFormFieldSetter/referenceFieldSetter.js'),
      'utf8'
    );
  });

  test('setReferenceFieldValue function must exist', () => {
    expect(code).toContain('async function setReferenceFieldValue(');
  });

  test('must handle display fields', () => {
    expect(code).toContain('sys_display');
    expect(code).toContain('displayField');
  });

  test('must trigger autocomplete events', () => {
    expect(code).toContain('dispatchEvent');
    expect(code).toMatch(/Event.*focus/);
    expect(code).toMatch(/Event.*input/);
  });

  test('must wait for autocomplete processing', () => {
    expect(code).toContain('delay');
    expect(code).toMatch(/delay\s*\(\s*[0-9]+/);
  });

  test('must trigger blur and change events', () => {
    expect(code).toMatch(/Event.*blur/);
    expect(code).toMatch(/Event.*change/);
  });
});
