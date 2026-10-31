import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import LegalLinks from '../../components/common/LegalLinks';
import { getLegalContent, LEGAL_CONTACT_EMAIL, LEGAL_UPDATED_DATE, CORPORATE_POLICY_URLS } from '../../content/legalContent';
import mirsatLogo from '../../assets/mirsat-logo-white.svg';

const PageStyle = createGlobalStyle`body { overflow-y: auto; }`;
const Page = styled.div`
  min-height: 100vh; background: #f5f7fb; color: #172b4d; line-height: 1.8;
  header { background: #001839; color: #fff; }
  .header-inner, main { max-width: 960px; margin: 0 auto; padding: 24px; }
  .header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .brand img { width: 140px; height: 48px; object-fit: contain; }
  .language { display: flex; flex-wrap: wrap; gap: 8px; }
  .language button { padding: 8px 14px; cursor: pointer; background: transparent; color: #fff; border: 1px solid #8ea3bd; border-radius: 8px; font: inherit; }
  .language button[aria-pressed='true'] { background: #fff; color: #001839; }
  article { margin-top: 24px; padding: clamp(20px, 5vw, 48px); border: 1px solid #dce3ee; border-radius: 16px; background: #fff; overflow-wrap: anywhere; }
  h1 { font-size: clamp(26px, 5vw, 40px); line-height: 1.4; margin: 0 0 12px; }
  h2 { font-size: 20px; line-height: 1.6; margin: 28px 0 8px; }
  p { margin: 0 0 12px; }
  .updated { color: #526277; font-size: 14px; }
  a { color: #164b87; text-underline-offset: 3px; }
  a:focus-visible, button:focus-visible { outline: 3px solid #b37b12; outline-offset: 4px; }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #dce3ee; }
  @media (max-width: 480px) { .header-inner, main { padding: 16px; } }
`;

export default function LegalPage({ documentType }) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const content = getLegalContent(currentLanguage);
  const document = content[documentType];
  const updatedDate = new Intl.DateTimeFormat(currentLanguage === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory', timeZone: 'UTC',
  }).format(new Date(`${LEGAL_UPDATED_DATE}T12:00:00Z`));

  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${document.title} | Mirsat`;
    window.scrollTo(0, 0);
    return () => { window.document.title = previousTitle; };
  }, [document.title]);

  return (
    <Page dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} lang={currentLanguage === 'ar' ? 'ar' : 'en'}>
      <PageStyle />
      <header><div className="header-inner">
        <Link to="/" className="brand" aria-label={content.labels.home}><img src={mirsatLogo} alt="Mirsat" /></Link>
        <div className="language" role="group" aria-label={content.labels.language}>
          <button type="button" lang="en" aria-pressed={currentLanguage !== 'ar'} onClick={() => changeLanguage('en')}>English</button>
          <button type="button" lang="ar" aria-pressed={currentLanguage === 'ar'} onClick={() => changeLanguage('ar')}>العربية</button>
        </div>
      </div></header>
      <main>
        <Link to="/">{content.labels.home}</Link>
        <article aria-labelledby="legal-title">
          <h1 id="legal-title">{document.title}</h1>
          <p className="updated">{content.labels.updated}: <time dateTime={LEGAL_UPDATED_DATE}>{updatedDate}</time></p>
          <p>{document.summary}</p>
          {document.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
          <section><h2>{content.labels.contact}</h2><p>{content.labels.email}: <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} dir="ltr">{LEGAL_CONTACT_EMAIL}</a></p></section>
          <p><a href={CORPORATE_POLICY_URLS[currentLanguage === 'ar' ? 'ar' : 'en']} target="_blank" rel="noopener noreferrer">{content.labels.corporatePolicy}</a></p>
          <footer><LegalLinks newTab={false} /></footer>
        </article>
      </main>
    </Page>
  );
}
