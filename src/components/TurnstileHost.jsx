import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal host for the invisible Turnstile widget.
 *
 * Rendered into document.body rather than inside the auth card, for two
 * concrete reasons: the login panel uses `transform: translateY(...)` and the
 * card uses `backdrop-filter`, and both create a containing block for
 * `position: fixed` descendants - so an overlay nested inside the card would be
 * positioned against the card and then clipped by the page's `overflow: hidden`.
 *
 * The widget itself is never hidden with display/visibility/opacity; Cloudflare
 * warns against that and hidden widgets can fail to execute. Under
 * `appearance: 'interaction-only'` it simply has no size until a challenge is
 * actually required, at which point the scrim below turns on.
 */
const TurnstileHost = ({ containerRef, interactive }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-hidden={!interactive}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: interactive ? 2147483000 : -1,
        pointerEvents: interactive ? 'auto' : 'none',
        background: interactive ? 'rgba(0, 24, 57, 0.65)' : 'transparent',
        transition: 'background 0.2s ease',
      }}
    >
      <div ref={containerRef} />
    </div>,
    document.body
  );
};

export default TurnstileHost;
