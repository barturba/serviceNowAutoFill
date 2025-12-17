/**
 * AngularJS manipulation helper utilities
 */

function setWorkNotesViaAngular(doc, workNotesField, finalWorkNotesText) {
  try {
    const angular = doc.defaultView.angular || window.angular || doc.defaultView.parent?.angular;
    if (!angular) return false;

    const scope = angular.element(workNotesField).scope();
    if (!scope) return false;

    const ngModel = workNotesField.getAttribute('ng-model');
    if (!ngModel) return false;

    const modelParts = ngModel.split('.');
    let target = scope;
    for (let i = 0; i < modelParts.length - 1; i++) {
      target = target[modelParts[i]];
      if (!target) return false;
    }
    target[modelParts[modelParts.length - 1]] = finalWorkNotesText;

    try {
      scope.$$phase ? scope.$evalAsync() : scope.$apply();
      return true;
    } catch (e) {
      try {
        scope.$digest();
        return true;
      } catch (e) {
        return false;
      }
    }
  } catch (e) {
    return false;
  }
}

// Make available globally
window.setWorkNotesViaAngular = setWorkNotesViaAngular;

