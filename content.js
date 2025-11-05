// Wait for the page to fully load
window.addEventListener('load', () => {
    // Example: Auto-fill incident form fields
    // Replace these selectors with actual ones from your ServiceNow instance
    const shortDescription = document.querySelector('input[name="incident.short_description"]');
    const description = document.querySelector('textarea[name="incident.description"]');
    const callerId = document.querySelector('input[name="incident.caller_id"]');
  
    if (shortDescription) {
      shortDescription.value = 'Auto-filled short description';
    }
    if (description) {
      description.value = 'Detailed auto-filled description here.';
    }
    if (callerId) {
      callerId.value = 'some_user_id'; // Or dynamically fetch/set
    }
  
    // Trigger change events if needed for ServiceNow's scripting
    [shortDescription, description, callerId].forEach(field => {
      if (field) {
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  
    console.log('Auto-fill complete!');
  });