import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { getLegalContent } from '../../content/legalContent';

const Links = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${props => props.$centered ? 'center' : 'flex-start'};
  gap: 8px 16px;
  font-size: 0.8125rem;
  line-height: 1.6;
  a { color: inherit; text-underline-offset: 3px; }
  a:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; border-radius: 2px; }
`;

// Keep an inspection or sign-in form in place when opening legal information.
export default function LegalLinks({ newTab = true, centered = false }) {
  const { currentLanguage } = useLanguage();
  const content = getLegalContent(currentLanguage);
  const target = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Links aria-label={content.labels.navigation} $centered={centered}>
      <Link to="/privacy-policy" {...target}>{content.privacy.title}</Link>
      <Link to="/terms-and-conditions" {...target}>{content.terms.title}</Link>
    </Links>
  );
}
