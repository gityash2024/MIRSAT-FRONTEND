/**
 * Cloudflare Turnstile configuration.
 *
 * Kept out of API_CONFIG deliberately - that object is API endpoints and
 * timeouts, and this is unrelated.
 *
 * An empty site key disables the widget completely: the hook no-ops, no script
 * is loaded, and the login and forgot-password pages behave exactly as they did
 * before Turnstile existed. That is the frontend kill switch, and it must be
 * flipped in lockstep with TURNSTILE_ENABLED on the backend.
 */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
export const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

/** Give up waiting for a challenge rather than leaving the button spinning forever. */
export const TURNSTILE_EXECUTE_TIMEOUT_MS = 20000;
