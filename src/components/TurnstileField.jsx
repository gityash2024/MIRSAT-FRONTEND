import React from 'react';
import styled from 'styled-components';
import { TURNSTILE_ENABLED } from '../config/turnstile';

/**
 * Slot for the visible Turnstile widget inside an auth form.
 *
 * Renders nothing at all when no site key is configured, so the form is
 * byte-for-byte what it was before Turnstile existed.
 *
 * min-height reserves the widget's own height up front, so the card does not
 * jump when Cloudflare finishes drawing it.
 */
const Slot = styled.div`
  margin-bottom: 1.25rem;
  min-height: 65px;
  display: flex;
  justify-content: center;

  /* The flexible widget fills the available width; cap it so it never pushes
     the card wider than its own padding allows. */
  > div {
    width: 100%;
    max-width: 100%;
  }
`;

const TurnstileField = ({ containerRef }) => {
  if (!TURNSTILE_ENABLED) return null;
  return <Slot><div ref={containerRef} /></Slot>;
};

export default TurnstileField;
