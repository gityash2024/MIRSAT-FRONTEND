/**
 * Open a server-supplied URL in a new tab, safely.
 *
 * Attachment and response URLs are stored data: whatever was persisted for a
 * task can end up here. Passing that straight to window.open means a stored
 * `javascript:` or `data:text/html` value becomes script execution in the
 * user's session. Only http(s) is allowed through.
 *
 * 'noopener,noreferrer' also prevents the opened page from reaching back
 * through window.opener (reverse tabnabbing).
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export const isSafeExternalUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    // Resolve against the current origin so protocol-relative and relative
    // URLs are handled the same way the browser would.
    const parsed = new URL(url, window.location.origin);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const openExternal = (url) => {
  if (!isSafeExternalUrl(url)) {
    console.error('Blocked attempt to open a URL with an unsupported scheme.');
    return null;
  }
  return window.open(url, '_blank', 'noopener,noreferrer');
};

export default openExternal;
