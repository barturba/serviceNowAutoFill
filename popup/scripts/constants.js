/**
 * Constants for script injection
 */

const REQUIRED_FILES = [
  // Core parsers and utilities (must load first)
  'utils/parsers/timeParser.js',
  'utils/constants.js',
  'utils/fields/core/fieldFinder.js',
  
  // Field finders (depend on fieldFinder.js)
  'utils/fields/finders/workStartFinder.js',
  'utils/fields/finders/workEndFinder.js',
  'utils/fields/finders/workNotesFinder.js',
  'utils/fields/finders/workTypeFinder.js',
  'utils/fields/finders/timeWorkedFinder.js',
  'utils/fields/finders/stateFinder.js',
  'utils/fields/finders/resolutionCodeFinder.js',
  'utils/fields/finders/closeNotesFinder.js',
  'utils/fields/finders/resolutionTabFinder.js',
  'utils/fields/finders/categoryFinder.js',
  'utils/fields/finders/subcategoryFinder.js',
  'utils/fields/finders/assignmentGroupFinder.js',
  'utils/fields/finders/assignedToFinder.js',
  
  // Iframe utilities (order matters: validator -> shadowDom -> finder)
  'utils/dom/iframeValidator.js',
  'utils/dom/shadowDomSearcher.js',
  'utils/dom/iframeFinder.js',
  
  // Field helpers (must load before files that use them)
  'utils/fields/helpers/fieldSetter.js',
  'utils/fields/helpers/gFormHelper.js',
  'utils/fields/helpers/angularHelper.js',
  'utils/fields/helpers/contentEditableHelper.js',
  'utils/dom/scrollManager.js',
  'utils/fields/fillers/timeFiller.js',
  
  // Work notes and type fillers (depend on helpers above)
  'utils/fields/core/workNoteExtractor.js',
  'utils/fields/fillers/workNotesFiller.js',
  'utils/fields/fillers/workTypeFiller.js',
  
  // Save button utilities
  'utils/actions/saveButtonFinder.js',
  'utils/actions/saveButtonValidator.js',
  'utils/actions/saveButtonHandler.js',
  
  // Validation (depends on IframeFinder)
  'utils/dom/injectValidator.js',
  
  // Core processors
  'core/formFiller.js',
  'core/alertClearedProcessor.js',
  // MACD Assignment Processor modules
  'core/macdAssignmentProcessor/fieldSetters.js',
  'core/macdAssignmentProcessor/steps.js',
  'core/macdAssignmentProcessor.js',
  
  // Entry point (must load last)
  'content/inject.js'
];

