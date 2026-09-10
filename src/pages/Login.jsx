import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import boat from '../assets/boat.jpeg';
import mirsatBrandLogo from '../assets/mirsat-logo-white.svg';
import takamolBrandLogo from '../assets/tms-logo-white.svg';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { getDefaultRouteForUser } from '../utils/defaultRoute';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    overflow: hidden; /* Prevent unnecessary scroll */
    direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  }
  
  @media (max-width: 768px) {
    body {
      overflow: auto; /* Allow scroll on mobile */
    }
  }
`;

const LoginContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: url(${boat}) center/cover no-repeat;
  overflow: hidden;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  input {
    padding: 1rem; /* Equal padding from all sides */
    margin: 0; /* Remove default margin */
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  height: 100vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  margin: 0 auto;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
  @media (max-width: 1024px) {
    max-width: 100%;
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: auto;
    min-height: 100vh;
    padding: 1rem;
    gap: 2rem;
    padding-top: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 1.5rem;
    padding-top: 0.75rem;
  }
`;

const Logo = styled(motion.div)`
  position: absolute;
  top: -12rem;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Motion owns transform during its entrance animation. */
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

const LoginPanel = styled.div`
  position: relative;
  width: 430px;
  flex: 0 0 430px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(6rem);

  @media (max-width: 768px) {
    width: 100%;
    max-width: 400px;
    flex-basis: auto;
    transform: none;
  }
`;

const LeftContent = styled(motion.div)`
  flex: 1;
  max-width: 600px;
  color: white;
  padding-${props => props.isRTL ? 'left' : 'right'}: 4rem;

  h1 {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    text-align: ${props => props.isRTL ? 'right' : 'left'};
  }

  p {
    font-size: 1.5rem;
    opacity: 0.9;
    text-align: ${props => props.isRTL ? 'right' : 'left'};
  }
  
  @media (max-width: 1024px) {
    padding-${props => props.isRTL ? 'left' : 'right'}: 2rem;
    
    h1 {
      font-size: 3rem;
    }
    
    p {
      font-size: 1.3rem;
    }
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding-${props => props.isRTL ? 'left' : 'right'}: 0;
    text-align: center;
    margin-bottom: 0;
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    p {
      font-size: 1.1rem;
      max-width: 500px;
      margin: 0 auto;
      text-align: center;
    }
  }
  
  @media (max-width: 480px) {
    h1 {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 1rem;
      line-height: 1.5;
    }
  }
`;

const LanguageToggle = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
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
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    min-height: 44px;
    margin: 0 0.25rem;
  }
`;

const LoginCard = styled(motion.div)`
  width: 430px;
  background: rgba(234, 243, 248, 0.88);
  backdrop-filter: blur(12px);
  border-radius: 1.5rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 16px 38px rgba(0, 24, 57, 0.22);
  margin-top: 76px;
  
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
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 1.25rem;
  }
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
  min-height: 44px; /* Ensure minimum touch target size */

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
    font-size: 1rem;
    min-height: 48px; /* Larger touch target on mobile */
    border-radius: 0.75rem;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
    }
  }
`;

const ErrorMessage = styled.span`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  color: rgba(0, 59, 102, 0.78);
  font-size: 0.875rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
  padding: 0.5rem 0; /* Add padding for better touch target */
  min-height: 32px; /* Minimum touch target */

  &:hover {
    color: #003b66;
  }
  
  @media (max-width: 768px) {
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 1.25rem;
    padding: 0.75rem 0; /* Larger touch area on mobile */
    min-height: 44px; /* Better touch target on mobile */
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
  min-height: 44px; /* Ensure minimum touch target size */

  &:hover {
    transform: translateY(-2px);
    background: #002d4d;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 1rem;
    min-height: 48px; /* Larger touch target on mobile */
    
    &:hover {
      transform: none; /* Disable hover transform on mobile */
    }
    
    &:active {
      transform: scale(0.98); /* Add active state for touch feedback */
    }
  }
`;

const SignUpText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-top: 1.5rem;

  a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 1.25rem;
  }
`;

const LanguageSeparator = styled.span`
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0.25rem;
  user-select: none;
  
  @media (max-width: 480px) {
    margin: 0 0.1rem;
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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
    
    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t('auth.emailRequired');
    if (!formData.password) newErrors.password = t('auth.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleLanguage = (lang) => {
    changeLanguage(lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setApiError(null);
    
    // Validate form
    if (!validateForm()) return;

    // Set loading state
    setIsLoading(true);

    try {
      // Dispatch login thunk
      const resultAction = await dispatch(login({
        ...formData,
        // Email addresses are case-insensitive. Keep the password exactly as
        // entered, including any intentional whitespace.
        email: formData.email.trim().toLowerCase(),
      })).unwrap();

    
      
   navigate(getDefaultRouteForUser(resultAction?.user));
    } catch (error) {
      const errorCode = typeof error === 'object' ? error?.code : 'server';
      const serverMessage = typeof error === 'object' ? error?.message : error;
      let errorMessage = serverMessage || t('auth.loginFailed');

      if (errorCode === 'timeout') {
        errorMessage = t('auth.requestTimedOut');
      } else if (errorCode === 'service_unavailable') {
        errorMessage = t('auth.serviceUnavailable');
      } else if (errorCode === 'network_unavailable') {
        errorMessage = t('auth.networkUnavailable');
      }
      
      // Check if the error is specifically about deactivated account
      if (errorCode === 'server' && typeof serverMessage === 'string' &&
          (serverMessage.toLowerCase().includes('deactivated') ||
           serverMessage.toLowerCase().includes('your account has been deactivated'))) {
        errorMessage = t('auth.accountDeactivated');
        toast.error(errorMessage); // Show toast for deactivated account
        // Don't set apiError to avoid duplicate display
      } else {
        setApiError(errorMessage);
      }
      // Don't refresh the page, just show the error message
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <>
    <GlobalStyle isRTL={isRTL} />
    <LoginContainer isRTL={isRTL}>
      <ContentWrapper isRTL={isRTL}>
        <LeftContent
          isRTL={isRTL}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1>{t('auth.heading')}</h1>
          <p>{t('auth.subtitle')}</p>
        </LeftContent>

        <LoginPanel>
          <Logo
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img src={mirsatBrandLogo} alt="MIRSAT" />
          </Logo>
          <LoginCard
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
          <Title>{t('auth.signInTitle')}</Title>
          <form onSubmit={handleSubmit}>
            {apiError && (
              <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {apiError}
              </ErrorMessage>
            )}

            <FormGroup>
              <Input
                type="email"
                name="email"
                placeholder={t('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Input
                type="password"
                name="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>

            <ForgotPassword to="/forgot-password">
              {t('auth.forgotPassword')}
            </ForgotPassword>

            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? t('auth.signingInButton') : t('auth.signInButton')}
            </SubmitButton>

            {/* <SignUpText>
              Don't have an account?
              <Link to="/register">Sign Up</Link>
            </SignUpText> */}
          </form>
          </LoginCard>
        </LoginPanel>
        
        <Footer isRTL={isRTL}>
          <FooterMeta>
            <span>{t('auth.copyright')}</span>
            <LanguageToggle
              className={currentLanguage === 'en' ? 'active' : ''}
              onClick={() => toggleLanguage('en')}
            >
              {t('common.english')}
            </LanguageToggle>
            <LanguageSeparator>|</LanguageSeparator>
            <LanguageToggle
              className={currentLanguage === 'ar' ? 'active' : ''}
              onClick={() => toggleLanguage('ar')}
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
    </LoginContainer>
    </>
  );
};

export default Login;
