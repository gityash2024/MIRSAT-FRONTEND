import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTurnstile } from '../utils/turnstile';
import {
  TURNSTILE_SITE_KEY,
  TURNSTILE_ENABLED,
  TURNSTILE_EXECUTE_TIMEOUT_MS,
} from '../config/turnstile';

/**
 * Visible Cloudflare Turnstile widget.
 *
 * Rendered on mount at `size: "flexible"` so it fills the card's inner width
 * (330px on desktop) at the standard ~65px height, and solves itself in the
 * background - the user sees the familiar Cloudflare box confirming the page is
 * protected, without having to click anything in the normal case.
 *
 * The token is captured as soon as Cloudflare issues it. `getToken()` returns
 * it immediately when it is already there, and otherwise waits briefly for it
 * rather than submitting blind. Tokens are single use, so `reset()` is called
 * after every attempt - that is what lets someone who mistyped their password
 * simply try again without reloading.
 *
 * With no site key configured the hook does nothing at all: no script is
 * loaded, no container is rendered, and the pages behave exactly as they did
 * before Turnstile existed.
 */
export const useTurnstile = (action) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const tokenRef = useRef(null);
  const waitersRef = useRef([]);
  const [ready, setReady] = useState(false);

  const deliver = useCallback((token) => {
    tokenRef.current = token;
    const waiters = waitersRef.current;
    waitersRef.current = [];
    waiters.forEach(({ resolve, timer }) => {
      clearTimeout(timer);
      resolve(token);
    });
  }, []);

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          size: 'flexible',
          // Cloudflare refreshes an expired token on its own, so a user who
          // leaves the page open still submits a valid one.
          'refresh-expired': 'auto',
          callback: (token) => { setReady(true); deliver(token); },
          'expired-callback': () => { tokenRef.current = null; setReady(false); },
          'error-callback': () => { setReady(false); deliver(null); },
          'timeout-callback': () => deliver(null),
        });
      })
      .catch(() => { /* blocked or offline: getToken() resolves null */ });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id !== null && window.turnstile) {
        try { window.turnstile.remove(id); } catch { /* already gone */ }
      }
    };
  }, [action, deliver]);

  /**
   * Resolve to a token, or to null if Turnstile is off, blocked, or slow.
   * Submitting without one is safe: the server decides, and the rate limiter
   * and per-account lockout are unaffected either way.
   */
  const getToken = useCallback(() => {
    if (!TURNSTILE_ENABLED || widgetIdRef.current === null) return Promise.resolve(null);
    if (tokenRef.current) return Promise.resolve(tokenRef.current);

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        waitersRef.current = waitersRef.current.filter((w) => w.resolve !== resolve);
        resolve(null);
      }, TURNSTILE_EXECUTE_TIMEOUT_MS);
      waitersRef.current.push({ resolve, timer });
    });
  }, []);

  const reset = useCallback(() => {
    tokenRef.current = null;
    if (widgetIdRef.current === null || !window.turnstile) return;
    try { window.turnstile.reset(widgetIdRef.current); } catch { /* ignore */ }
  }, []);

  return { containerRef, getToken, reset, ready, enabled: TURNSTILE_ENABLED };
};

export default useTurnstile;
