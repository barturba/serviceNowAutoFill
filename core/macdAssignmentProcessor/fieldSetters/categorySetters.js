/**
 * Category and subcategory field setters
 */

function setCategoryField(doc, field) {
  if (!field) return false;
  window.setSelectFieldValue(doc, field, 'category', 
    o => o.text === 'Collaboration' || o.value === 'Collaboration', 
    'Collaboration');
  window.dispatchFieldEvents(field, ['input', 'change']);
  return true;
}

async function setSubcategoryField(doc, field) {
  if (!field) return false;
  
  const maxAttempts = window.TimingConstants?.SUBCATEGORY_RETRY_ATTEMPTS || 5;
  const retryInterval = window.TimingConstants?.SUBCATEGORY_RETRY_INTERVAL || 200;
  const optionMatcher = o => o.text === 'MACD' || o.value === 'MACD';
  const targetValue = 'MACD';
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (field.tagName === 'SELECT') {
      const matchedOption = Array.from(field.options).find(optionMatcher);
      if (matchedOption) {
        window.setSelectFieldValue(doc, field, 'subcategory', optionMatcher, targetValue);
        window.dispatchFieldEvents(field, ['input', 'change']);
        console.log(`✓ Subcategory MACD option found and set (attempt ${attempt})`);
        return true;
      }
    } else {
      window.setSelectFieldValue(doc, field, 'subcategory', optionMatcher, targetValue);
      window.dispatchFieldEvents(field, ['input', 'change']);
      return true;
    }
    
    if (attempt < maxAttempts) {
      console.log(`Subcategory MACD option not yet available, retrying (attempt ${attempt}/${maxAttempts})...`);
      await window.delay(retryInterval);
    }
  }
  
  console.log(`✗ Subcategory MACD option not found after ${maxAttempts} attempts`);
  return false;
}
