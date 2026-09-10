/**
 * Loader for the Cloudflare Turnstile script.
 *
 * Hand-rolled rather than pulling in a wrapper package: this runs on the login
 * page, where a compromised transitive dependency would sit next to the
 * password field. Ninety lines is a fair price for not widening the supply
 * chain on the auth path.
 */
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

// Module-level so React StrictMode's double-invoked effect reuses the in-flight
// promise instead of appending a second <script>. Never cleared on success, and
// the tag is never removed on unmount - that is what makes remounting cheap.
let scriptPromise = null;

export const loadTurnstile = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('turnstile_no_window'));
  }
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile="1"]');
    const el = existing || document.createElement('script');

    el.addEventListener('load', () => {
      // Deliberately NOT calling turnstile.ready() here: Cloudflare throws
      // "Remove async/defer from the Turnstile api.js script tag before using
      // turnstile.ready()". Keeping async+defer is the right call for page
      // load, and once this load event has fired the API is already usable.
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('turnstile_unavailable'));
    }, { once: true });

    el.addEventListener('error', () => {
      scriptPromise = null; // let a later mount retry
      reject(new Error('turnstile_script_blocked'));
    }, { once: true });

    if (!existing) {
      el.src = SCRIPT_SRC;
      el.async = true;
      el.defer = true;
      el.dataset.turnstile = '1';
      document.head.appendChild(el);
    }
  });

  return scriptPromise;
};
