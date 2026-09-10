import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTurnstile } from '../utils/turnstile';
import {
  TURNSTILE_SITE_KEY,
  TURNSTILE_ENABLED,
  TURNSTILE_EXECUTE_TIMEOUT_MS,
} from '../config/turnstile';

/**
 * Invisible Turnstile, executed on demand.
 *
 * Rendered with `execution: 'execute'` and `appearance: 'interaction-only'`, so
 * it occupies zero height for the overwhelming majority of users who are never
 * challenged. That is what keeps the login card exactly the size it is today -
 * the card sits in a `height: 100vh; overflow: hidden` container, so an in-flow
 * 65px widget would clip on short viewports.
 *
 * Running the challenge inside the submit handler rather than on mount also
 * means the token is minted milliseconds before it is posted, so its ~300s
 * lifetime is never a factor.
 *
 * Returns `execute()` which resolves to a token, or to null when Turnstile is
 * switched off or unavailable - the caller submits regardless and the server
 * decides. Failing the sign-in because a CAPTCHA script did not load would be
 * a worse outcome than letting the server's own rate limiting handle it.
 */
export const useTurnstile = (action) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const pendingRef = useRef(null);
  const [interactive, setInteractive] = useState(false);

  const settle = useCallback((token) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    clearTimeout(pending.timer);
    setInteractive(false);
    pending.resolve(token);
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
          execution: 'execute',
          appearance: 'interaction-only',
          callback: (token) => settle(token),
          'error-callback': () => settle(null),
          'timeout-callback': () => settle(null),
          'before-interactive-callback': () => setInteractive(true),
          'after-interactive-callback': () => setInteractive(false),
        });
      })
      .catch(() => { /* blocked or offline: execute() resolves null */ });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id !== null && window.turnstile) {
        try { window.turnstile.remove(id); } catch { /* already gone */ }
      }
    };
  }, [action, settle]);

  const execute = useCallback(() => {
    if (!TURNSTILE_ENABLED || widgetIdRef.current === null || !window.turnstile) {
      return Promise.resolve(null);
    }
    // A challenge is already running - do not start a second one.
    if (pendingRef.current) return Promise.resolve(null);

    return new Promise((resolve) => {
      const timer = setTimeout(() => settle(null), TURNSTILE_EXECUTE_TIMEOUT_MS);
      pendingRef.current = { resolve, timer };
      try {
        window.turnstile.execute(widgetIdRef.current);
      } catch {
        settle(null);
      }
    });
  }, [settle]);

  const reset = useCallback(() => {
    if (widgetIdRef.current === null || !window.turnstile) return;
    try { window.turnstile.reset(widgetIdRef.current); } catch { /* ignore */ }
  }, []);

  return { containerRef, execute, reset, interactive, enabled: TURNSTILE_ENABLED };
};

export default useTurnstile;
