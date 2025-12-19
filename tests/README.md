# Test Suite

## Running Tests

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

- `button-functionality.test.js` - Tests for button handler setup and registration
- `reference-field-setter.test.js` - Tests for ServiceNow reference field assignment
- `integration-smoke.test.js` - End-to-end integration tests

## Adding New Tests

When adding new functionality, please add corresponding tests:

1. Unit tests for individual functions
2. Integration tests for workflows
3. Smoke tests for critical user paths

## Regression Prevention

The test suite includes critical regression tests to catch issues like:
- Missing function definitions that break inline buttons
- Reference field assignment failures

Run tests before every commit to prevent breaking changes.

