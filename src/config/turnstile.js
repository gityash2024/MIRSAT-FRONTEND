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

/**
 * How long to wait for a challenge before submitting without a token.
 *
 * Turnstile normally resolves in well under two seconds. This ceiling only
 * matters when it cannot resolve at all - an ad-blocker or privacy extension
 * blocking challenges.cloudflare.com, or a network hiccup - and in that case
 * the user should not be left staring at a spinner. Six seconds is generous
 * for the happy path and tolerable as a worst case.
 *
 * Submitting without a token is safe: the server decides what to do with a
 * missing one, and the rate limiter and per-account lockout are unaffected.
 */
export const TURNSTILE_EXECUTE_TIMEOUT_MS = 6000;
