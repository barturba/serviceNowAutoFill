const path = require('path');

describe('timeWorkedFinder', () => {
  const finderPath = path.join(
    __dirname,
    '../../utils/fields/finders/timeWorkedFinder.js'
  );

  beforeEach(() => {
    jest.resetModules();
    window.FieldFinder = {
      logDebug: jest.fn(),
      captureException: jest.fn(),
      waitForElement: jest.fn()
    };
  });

  test('returns time worked fields when present', async () => {
    require(finderPath);

    const doc = document.implementation.createHTMLDocument('time test');
    const container = doc.createElement('div');
    container.id = 'time_worked_test';

    for (let i = 0; i < 3; i += 1) {
      const input = doc.createElement('input');
      input.className = 'form-control';
      container.appendChild(input);
    }

    const hidden = doc.createElement('input');
    hidden.id = 'foo_time_worked';

    doc.body.appendChild(container);
    doc.body.appendChild(hidden);

    const fields = await window.FieldFinder.findTimeWorkedFields(doc);

    expect(fields.container).toBe(container);
    expect(fields.hourInput).toBe(container.querySelectorAll('input')[0]);
    expect(fields.minInput).toBe(container.querySelectorAll('input')[1]);
    expect(fields.secInput).toBe(container.querySelectorAll('input')[2]);
    expect(fields.hiddenTime).toBe(hidden);
  });

  test('captures exception when hidden field is missing', async () => {
    require(finderPath);

    const doc = document.implementation.createHTMLDocument('time missing');
    const container = doc.createElement('div');
    container.id = 'time_worked_missing';

    for (let i = 0; i < 3; i += 1) {
      const input = doc.createElement('input');
      input.className = 'form-control';
      container.appendChild(input);
    }

    doc.body.appendChild(container);

    await expect(window.FieldFinder.findTimeWorkedFields(doc))
      .rejects.toThrow('Hidden time field not found');
    expect(window.FieldFinder.captureException).toHaveBeenCalled();
  });
});

