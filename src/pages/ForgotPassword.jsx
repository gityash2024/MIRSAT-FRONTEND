import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import boat from '../assets/boat.jpeg';
import mirsatBrandLogo from '../assets/mirsat-logo-white.svg';
import takamolBrandLogo from '../assets/tms-logo-white.svg';
import { useLanguage } from '../context/LanguageContext';
import { useTurnstile } from '../hooks/useTurnstile';
import TurnstileField from '../components/TurnstileField';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    overflow: hidden;
  }
`;

const ForgotPasswordContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: url(${boat}) center/cover no-repeat;
  overflow: hidden;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

  @media (min-width: 769px) and (max-height: 820px) {
    overflow-y: auto;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 24, 57, 0.9) 0%, rgba(0, 24, 57, 0.7) 100%);
    z-index: 1;
  }

  @media (max-width: 768px) {
    min-height: 100vh;
    height: auto;
    overflow: visible;

    &::before {
      background: linear-gradient(135deg, rgba(0, 24, 57, 0.95) 0%, rgba(0, 24, 57, 0.9) 100%);
    }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin: 0 auto;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: flex-start;
    height: auto;
    min-height: 100vh;
    padding: 1rem;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 1.5rem;
  }
`;

/* Same panel + floating brand logo arrangement as the login page. */
const Panel = styled.div`
  position: relative;
  width: 430px;
  flex: 0 0 430px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(4rem);

  @media (min-width: 769px) and (max-height: 820px) {
    transform: translateY(1rem);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    flex-basis: auto;
    transform: none;
    margin-top: 3rem;
  }
`;

const Logo = styled(motion.div)`
  position: absolute;
  top: -12rem;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  translate: -50% 0;
  z-index: 1;

  img {
    height: 14rem;
    width: auto;
    filter: drop-shadow(0 5px 12px rgba(0, 24, 57, 0.2));
  }

  @media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    translate: none;
    margin-bottom: 1.25rem;

    img {
      height: 8.5rem;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 1rem;

    img {
      height: 6.5rem;
    }
  }
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 2rem;
  ${props => props.$isRTL ? 'right: 2rem;' : 'left: 2rem;'}
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  z-index: 3;

  svg {
    transform: ${props => props.$isRTL ? 'scaleX(-1)' : 'none'};
  }

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    top: 1rem;
    ${props => props.$isRTL ? 'right: 1rem;' : 'left: 1rem;'}
  }
`;

const ForgotPasswordCard = styled(motion.div)`
  width: 430px;
  background: rgba(234, 243, 248, 0.88);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 16px 38px rgba(0, 24, 57, 0.22);
  margin-top: 76px;

  @media (min-width: 769px) and (max-height: 820px) {
    margin-top: 24px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h2`
  color: #003b66;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  color: rgba(0, 59, 102, 0.78);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(202, 224, 236, 0.9);
  border: 1px solid rgba(159, 196, 215, 0.7);
  border-radius: 0.5rem;
  color: #003b66;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-height: 44px;

  &::placeholder {
    color: rgba(0, 59, 102, 0.72);
  }

  &:focus {
    outline: none;
    border-color: #2a75a5;
    background: #e2f0f7;
    box-shadow: 0 0 0 3px rgba(42, 117, 165, 0.16);
  }

  @media (max-width: 480px) {
    padding: 1rem;
    min-height: 48px;
    border-radius: 0.75rem;
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 0.875rem;
  background: #003b66;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-bottom: 1.5rem;
  min-height: 44px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: #002d4d;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    min-height: 48px;

    &:hover:not(:disabled) {
      transform: none;
    }
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  ${props => props.type === 'success' ? `
    background: rgba(34, 197, 94, 0.14);
    color: #15803d;
    border: 1px solid rgba(34, 197, 94, 0.35);
  ` : `
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.35);
  `}
`;

const BackToLogin = styled(Link)`
  display: block;
  text-align: center;
  color: rgba(0, 59, 102, 0.78);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 0.5rem 0;

  &:hover {
    color: #003b66;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 2.5rem;
  ${props => props.isRTL ? 'right: 3.5rem; left: auto;' : 'left: 3.5rem; right: auto;'}
  z-index: 3;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isRTL ? 'flex-end' : 'flex-start'};
  gap: 0.45rem;

  @media (max-width: 768px) {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    align-items: center;
    text-align: center;
    margin: 0 auto 1rem;
    font-size: 0.875rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const FooterMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.1rem;
`;

const LanguageToggle = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0.5rem;
  padding: 0.5rem;
  transition: color 0.3s ease;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  border-radius: 4px;
  min-height: 32px;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: white;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const LanguageSeparator = styled.span`
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0.25rem;
  user-select: none;
`;

const PoweredBy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isRTL ? 'flex-end' : 'flex-start'};
  gap: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.8rem;

  .takamol-logo-frame {
    width: 260px;
    height: 52px;
    overflow: hidden;
    position: relative;
  }

  .takamol-logo {
    width: 260px;
    height: auto;
    display: block;
    position: absolute;
    top: -30px;
    left: 0;
  }

  @media (max-width: 768px) {
    align-items: center;

    .takamol-logo-frame {
      width: 220px;
      height: 44px;
    }

    .takamol-logo {
      width: 220px;
      top: -26px;
    }
  }
`;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);
  const turnstile = useTurnstile('forgot_password');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: t('auth.emailRequired') });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: t('auth.invalidEmail') });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const captchaToken = await turnstile.getToken();
      await authService.forgotPassword(email, captchaToken);
      setEmailSent(true);
      setMessage({ 
        type: 'success', 
        text: t('auth.resetEmailSent') 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || t('auth.resetEmailFailed') 
      });
    } finally {
      turnstile.reset();
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <ForgotPasswordContainer isRTL={isRTL}>
        <BackButton to="/login" $isRTL={isRTL}>
          <ArrowLeft size={16} />
          {t('auth.backToLogin')}
        </BackButton>

        <ContentWrapper isRTL={isRTL}>
          <Panel>
            <Logo
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img src={mirsatBrandLogo} alt="MIRSAT" />
            </Logo>
            <ForgotPasswordCard
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Title>{t('auth.resetPassword')}</Title>
              <Description>
                {t('auth.resetPasswordSubtitle')}
              </Description>

              {message.text && (
                <Message type={message.type}>
                  {message.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {message.text}
                </Message>
              )}

              {!emailSent && (
                <form onSubmit={handleSubmit}>
                  <FormGroup>
                    <Input
                      type="email"
                      placeholder={t('auth.emailPlaceholder') || "Enter your email address"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>

                  <TurnstileField containerRef={turnstile.containerRef} />

                  <SubmitButton
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    {isLoading ? t('auth.sending') : t('auth.sendResetLink')}
                  </SubmitButton>
                </form>
              )}

              <BackToLogin to="/login">
                {emailSent ? t('auth.backToLogin') : t('auth.rememberPassword')}
              </BackToLogin>
            </ForgotPasswordCard>
          </Panel>

          <Footer isRTL={isRTL}>
            <FooterMeta>
              <span>{t('auth.copyright')}</span>
              <LanguageToggle
                type="button"
                className={currentLanguage === 'en' ? 'active' : ''}
                onClick={() => changeLanguage('en')}
              >
                {t('common.english')}
              </LanguageToggle>
              <LanguageSeparator>|</LanguageSeparator>
              <LanguageToggle
                type="button"
                className={currentLanguage === 'ar' ? 'active' : ''}
                onClick={() => changeLanguage('ar')}
              >
                {t('common.arabic')}
              </LanguageToggle>
            </FooterMeta>
            <PoweredBy isRTL={isRTL}>
              <span>{t('auth.poweredBy')}</span>
              <div className="takamol-logo-frame">
                <img className="takamol-logo" src={takamolBrandLogo} alt="Takamol Mobility Services" />
              </div>
            </PoweredBy>
          </Footer>
        </ContentWrapper>
      </ForgotPasswordContainer>
    </>
  );
};

export default ForgotPassword; 