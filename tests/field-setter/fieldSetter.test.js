const path = require('path');

describe('fieldSetter helpers', () => {
  const fieldSetterPath = path.join(
    __dirname,
    '../../utils/fields/helpers/fieldSetter.js'
  );

  beforeEach(() => {
    jest.resetModules();
    delete window.setFieldValue;
    delete window.setSelectFieldValue;
    delete window.dispatchFieldEvents;
    delete window.getGForm;
  });

  test('setFieldValue uses g_form when available', () => {
    const setValue = jest.fn();
    window.getGForm = () => ({ setValue });
    require(fieldSetterPath);

    const field = document.createElement('input');
    window.setFieldValue(document, field, 'state', '2');

    expect(setValue).toHaveBeenCalledWith('state', '2');
  });

  test('setFieldValue falls back to DOM value when g_form is missing', () => {
    window.getGForm = () => null;
    require(fieldSetterPath);

    const field = document.createElement('input');
    window.setFieldValue(document, field, 'state', '3');

    expect(field.value).toBe('3');
  });

  test('dispatchFieldEvents triggers provided events', () => {
    require(fieldSetterPath);

    const field = document.createElement('input');
    const handler = jest.fn();
    field.addEventListener('change', handler);

    window.dispatchFieldEvents(field, ['change']);

    expect(handler).toHaveBeenCalled();
  });
});

