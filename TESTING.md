# Testing Guide

## Setup

1. Install test dependencies:
```bash
npm install
```

2. Install pre-commit hook (optional but recommended):
```bash
ln -s ../../.githooks/pre-commit .git/hooks/pre-commit
```

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Manual Testing Checklist

Before each release, manually verify:

### Time Entry Buttons
- [ ] Click 15 min button - fills time without saving
- [ ] Click 30 min button - fills time without saving
- [ ] Click 1 hour button - fills time without saving
- [ ] Click 15 min (green) button - fills time AND saves
- [ ] Click 30 min (green) button - fills time AND saves
- [ ] Additional comments field works

### MACD Assignment
- [ ] Agent dropdown populates with team members
- [ ] Select an agent (e.g., John Smith)
- [ ] Click "Assign to MACD" button
- [ ] Verify all fields update:
  - Category = "User Administration"
  - Subcategory = "MACD"
  - Assignment Group = "MS MACD"
  - Assigned To = selected agent name
  - State = "Work in Progress"
- [ ] Verify display name appears in Assigned To field (not username)

### Alert Cleared
- [ ] Click "Alert Cleared" button
- [ ] Verify fields populate correctly

### Stale Incidents
- [ ] Click "Open Stale Incidents" button
- [ ] Verify stale incidents open in new tabs

## Regression Tests

The test suite includes specific regression tests for:

1. **Reference Field Assignment** - Ensures display fields are properly set for autocomplete
2. **MACD Assignment Steps** - Ensures processors set state/category/subcategory/assignment correctly

These tests prevent critical bugs like:
- MACD assignment failures due to improper reference field handling

## Test Coverage Goals

Minimum coverage thresholds:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Debugging Failed Tests

If tests fail:

1. Check console output for specific test failures
2. Run with verbose output: `npm test -- --verbose`
3. Run single test file: `npm test -- button-functionality.test.js`
4. Use watch mode to iterate: `npm run test:watch`

## Adding New Tests

When adding new features:

1. Add unit tests in `tests/[feature-name].test.js`
2. Update integration tests if adding new workflows
3. Add manual testing steps to this checklist
4. Run full test suite before committing

