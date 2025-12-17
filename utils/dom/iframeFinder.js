/**
 * Iframe finding utilities for ServiceNow pages
 */

window.IframeFinder = window.IframeFinder || {};

window.IframeFinder.IFRAME_SELECTORS = [
  'iframe#gsft_main', 'iframe[name="gsft_main"]', 'iframe[id*="gsft"]',
  'iframe[name*="gsft"]', 'iframe[title*="Main"]', 'iframe[title*="Content"]',
  'iframe[src*="incident"]', 'iframe[src*="sys_id"]', 'iframe'
];
