/**
 * Production console and inspection hardening.
 *
 * Two separate jobs:
 *
 *  1. SILENCE THE CONSOLE (a real control). The build already strips this
 *     application's own console.log/info/debug/trace calls, but third-party
 *     libraries still write to the console at runtime, and anything logged there
 *     is readable by whoever is sitting at the machine. Replacing the console
 *     methods at runtime closes that remaining gap.
 *
 *  2. DETER CASUAL INSPECTION (a deterrent, NOT a security control). Blocking
 *     F12 and the context menu stops a curious user poking around; it does not
 *     stop anyone who intends to. DevTools can still be opened from the browser
 *     menu, and the API can be called directly with curl. Nothing here is
 *     load-bearing - the server-side authorization added alongside it is what
 *     actually protects data.
 *
 * Deliberately NOT implemented: `debugger` trap loops, DevTools-size detection
 * with page blanking, and similar anti-debugging tricks. They make the page
 * unusable when they misfire, break legitimate support work, and are trivially
 * bypassed - a bad trade against this constraint of changing nothing about how
 * the app behaves for real users.
 *
 * Development builds are untouched, so day-to-day debugging is unaffected.
 */

const CONSOLE_METHODS = [
  'log', 'info', 'debug', 'trace', 'warn', 'error',
  'dir', 'dirxml', 'table', 'group', 'groupCollapsed', 'groupEnd',
  'time', 'timeEnd', 'timeLog', 'count', 'countReset', 'assert', 'profile', 'profileEnd',
];

const silenceConsole = () => {
  if (typeof window === 'undefined' || !window.console) return;
  const noop = () => {};
  CONSOLE_METHODS.forEach((method) => {
    try {
      // eslint-disable-next-line no-console
      if (typeof window.console[method] === 'function') {
        window.console[method] = noop;
      }
    } catch {
      // Some browsers make console properties non-writable; nothing to do.
    }
  });
};

// Keyboard shortcuts that open developer tools or view-source.
const isInspectionShortcut = (event) => {
  const key = String(event.key || '').toLowerCase();
  if (key === 'f12') return true;
  const modifier = event.ctrlKey || event.metaKey;
  if (!modifier) return false;
  // Ctrl/Cmd+Shift+I / J / C - devtools panels
  if (event.shiftKey && ['i', 'j', 'c'].includes(key)) return true;
  // Ctrl/Cmd+U - view source
  if (!event.shiftKey && key === 'u') return true;
  return false;
};

/**
 * Right-click is blocked, but NOT on fields the user types into.
 *
 * This exception matters: inspectors and administrators routinely right-click to
 * paste into form inputs, and taking that away would be a real usability
 * regression. Text selection and Ctrl/Cmd+C are unaffected everywhere.
 */
const isEditableTarget = (target) => {
  if (!target || !target.tagName) return false;
  const tag = target.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(target.isContentEditable || target.closest?.('[contenteditable="true"]'));
};

export const installConsoleGuard = () => {
  // import.meta.env.PROD is replaced at build time, so the whole guard is
  // tree-shaken out of development builds.
  if (!import.meta.env.PROD) return;

  silenceConsole();

  window.addEventListener('keydown', (event) => {
    if (isInspectionShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { capture: true });

  window.addEventListener('contextmenu', (event) => {
    if (isEditableTarget(event.target)) return; // keep paste working
    event.preventDefault();
  }, { capture: true });
};

export default installConsoleGuard;
