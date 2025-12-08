/**
 * Constants for script injection
 */

const REQUIRED_FILES = [
  // Core parsers and utilities (must load first)
  'utils/parsers/timeParser.js',
  'utils/fields/fieldFinder.js',
  
  // Field finders (depend on fieldFinder.js)
  'utils/fields/finders/workStartFinder.js',
  'utils/fields/finders/workEndFinder.js',
  'utils/fields/finders/workNotesFinder.js',
  'utils/fields/finders/workTypeFinder.js',
  'utils/fields/finders/timeWorkedFinder.js',
  'utils/fields/finders/stateFinder.js',
  'utils/fields/finders/resolutionCodeFinder.js',
  'utils/fields/finders/closeNotesFinder.js',
  
  // Iframe utilities (order matters: validator -> shadowDom -> finder)
  'utils/dom/iframeValidator.js',
  'utils/dom/shadowDomSearcher.js',
  'utils/dom/iframeFinder.js',
  
  // Field helpers (must load before files that use them)
  'utils/fields/fieldSetter.js',
  'utils/fields/gFormHelper.js',
  'utils/fields/angularHelper.js',
  'utils/fields/contentEditableHelper.js',
  'utils/fields/resolutionTabFinder.js',
  'utils/dom/scrollManager.js',
  'utils/fields/timeFiller.js',
  
  // Work notes and type fillers (depend on helpers above)
  'utils/fields/workNoteExtractor.js',
  'utils/fields/workNotesFiller.js',
  'utils/fields/workTypeFiller.js',
  
  // Save button utilities
  'utils/actions/saveButtonFinder.js',
  'utils/actions/saveButtonValidator.js',
  'utils/actions/saveButtonHandler.js',
  
  // Validation (depends on IframeFinder)
  'utils/dom/injectValidator.js',
  
  // Core processors
  'core/formFiller.js',
  'core/alertClearedProcessor.js',
  
  // Entry point (must load last)
  'content/inject.js'
];

