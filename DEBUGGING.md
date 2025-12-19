# Debugging Guide

## Debug Mode

The extension includes a conditional debug logging system that can be enabled or disabled without modifying code.

### Enabling Debug Mode

Debug mode is disabled by default for performance and security. To enable:

1. **Via Browser Console:**
```javascript
window.DebugLogger.setDebugMode(true);
```

2. **Via Chrome Storage:**
```javascript
chrome.storage.local.set({ debugMode: true });
// Then reload the extension
```

### Disabling Debug Mode

```javascript
window.DebugLogger.setDebugMode(false);
```

### Debug Logging API

The extension uses `window.DebugLogger` for all logging:

- `window.DebugLogger.log(...)` - Debug messages (only when debug mode is enabled)
- `window.DebugLogger.error(...)` - Error messages (always logged)
- `window.DebugLogger.warn(...)` - Warning messages (always logged)

### Migration from console.log

The codebase has been migrated from `console.log` to conditional debug logging:

**Before:**
```javascript
console.log('Starting MACD assignment...');
```

**After:**
```javascript
window.DebugLogger.log('Starting MACD assignment...');
```

### Benefits

1. **Performance**: No logging overhead in production when debug mode is disabled
2. **Security**: Prevents exposure of internal logic and data in production
3. **Flexibility**: Can enable debugging in the field without code changes
4. **Consistency**: Standardized logging format with [DEBUG], [ERROR], [WARN] prefixes

## Error Handling

### Standardized Error Responses

All async operations return standardized response objects:

**Success Response:**
```javascript
{
  success: true,
  warnings: ['Optional array of warning messages'],
  data: {} // Optional data payload
}
```

**Error Response:**
```javascript
{
  success: false,
  error: 'Error message',
  context: 'Optional context about where error occurred'
}
```

### Error Handler API

Use `window.ErrorHandler` for consistent error handling:

```javascript
// In try-catch blocks
try {
  // Your code
  return window.ErrorHandler.createSuccess();
} catch (error) {
  return window.ErrorHandler.handleError(error, 'Context description');
}

// Creating success with warnings
return window.ErrorHandler.createSuccess(['Warning 1', 'Warning 2']);

// Creating explicit error
return window.ErrorHandler.createError('Something went wrong', 'Optional context');
```

## Delay Documentation

All delays in the codebase use `window.delay()` and constants from `utils/constants.js`:

### Timing Constants

```javascript
DELAY_BUTTON_CLICK: 200ms           // After button interactions
DELAY_SAVE_VERIFY: 300ms           // Verify save completion
DELAY_FIELD_FOCUS: 100ms           // Between field focus operations
DELAY_TAB_SWITCH_INITIAL: 100ms    // Before tab switch
DELAY_TAB_SWITCH_FINAL: 400ms      // After tab switch
DELAY_IFRAME_POLL: 500ms           // Between iframe search attempts
DELAY_ALERT_CLEARED: 100ms         // UI update completion
DELAY_ASSIGNMENT_GROUP_PROCESS: 800ms // Autocomplete processing
DELAY_SUBCATEGORY_LOAD: 600ms      // Subcategory options load
```

### Smart Delays

TODO: Replace fixed delays with condition polling where possible:

**Current (fixed delay):**
```javascript
await window.delay(800); // Wait for autocomplete
```

**Future (smart polling):**
```javascript
await waitForCondition(() => field.value !== '', 800, 100);
```

## Performance Profiling

To profile extension performance:

1. Enable debug mode
2. Check Chrome DevTools Console for timing information
3. Debug logs include operation start/completion markers

## Common Issues

### Issue: "Scripts not injected" error
- **Cause**: Content scripts failed to load
- **Debug**: Enable debug mode and check console for injection errors
- **Fix**: Reload the page or re-inject scripts

### Issue: Fields not filling
- **Cause**: Field selectors may have changed or timing issues
- **Debug**: Enable debug mode and check field finder logs
- **Fix**: Verify field IDs match expectations, increase delays if needed

### Issue: Autocomplete not working
- **Cause**: ServiceNow autocomplete timing
- **Debug**: Check DELAY_ASSIGNMENT_GROUP_PROCESS timing
- **Fix**: May need to increase delay constant (currently 800ms)



