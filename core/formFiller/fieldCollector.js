/**
 * Field collection for form filling
 */

async function collectFormFields(doc) {
  const timeFields = await window.FieldFinder.findTimeWorkedFields(doc);
  const startField = await window.FieldFinder.findWorkStartField(doc);
  const endField = await window.FieldFinder.findWorkEndField(doc);
  const { field: workNotesField, editable: workNotesEditable } = 
    await window.FieldFinder.findWorkNotesField(doc);
  const workTypeField = await window.FieldFinder.findWorkTypeField(doc);
  
  return { timeFields, startField, endField, workNotesField, workNotesEditable, workTypeField };
}

window.collectFormFields = collectFormFields;

