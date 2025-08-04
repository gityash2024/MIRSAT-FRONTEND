import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import boat from '../assets/boat.jpeg';

// Translation objects
const translations = {
  en: {
    heading: "Marine services made easier and faster.",
    subtitle: "Simplify your marine services with an easy-to-use digital application.",
    signInTitle: "Sign in to your account",
    emailPlaceholder: "Email*",
    passwordPlaceholder: "Password*",
    forgotPassword: "Forgot password?",
    signInButton: "Sign In",
    signingInButton: "Signing In...",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    copyright: "©2025 Mirsat",
    english: "English",
    arabic: "العربية"
  },
  ar: {
    heading: "خدمات بحرية أسهل وأسرع.",
    subtitle: "بسّط خدماتك البحرية باستخدام تطبيق رقمي سهل الاستخدام.",
    signInTitle: "تسجيل الدخول إلى حسابك",
    emailPlaceholder: "*البريد الإلكتروني",
    passwordPlaceholder: "*كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    signInButton: "تسجيل الدخول",
    signingInButton: "جاري تسجيل الدخول...",
    emailRequired: "البريد الإلكتروني مطلوب",
    passwordRequired: "كلمة المرور مطلوبة",
    copyright: "©2025 مرساة",
    english: "English",
    arabic: "العربية"
  }
};

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
    padding-top: 6rem; /* Account for logo */
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 1.5rem;
    padding-top: 5rem;
  }
`;

const Logo = styled(motion.div)`
  position: absolute;
  top: 2rem;
  ${props => props.isRTL ? 'left: 2rem;' : 'right: 2rem;'}
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 3;

  img {
    height: 3rem;
  }

  span {
    color: white;
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    top: 1.5rem;
    ${props => props.isRTL ? 'left: 50%;' : 'right: 50%;'}
    transform: translateX(50%);
    
    img {
      height: 2.5rem;
    }
    
    span {
      font-size: 1.25rem;
    }
  }
  
  @media (max-width: 480px) {
    top: 1rem;
    
    img {
      height: 2rem;
    }
    
    span {
      font-size: 1.1rem;
    }
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
  width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
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
  color: white;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-height: 44px; /* Ensure minimum touch target size */

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;
  padding: 0.5rem 0; /* Add padding for better touch target */
  min-height: 32px; /* Minimum touch target */

  &:hover {
    color: white;
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
  background: linear-gradient(135deg, #0056b3 0%, #007bff 100%);
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
  bottom: 2rem;
  left: 2rem;
  z-index: 3;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin: 0 0.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
  
  @media (max-width: 768px) {
    position: relative;
    bottom: auto;
    left: auto;
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 1.5rem;
    gap: 0.25rem;
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState('en'); // Add language state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const t = translations[language]; // Get current translations
  const isRTL = language === 'ar'; // Check if RTL

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
    if (!formData.email) newErrors.email = t.emailRequired;
    if (!formData.password) newErrors.password = t.passwordRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleLanguage = (lang) => {
    setLanguage(lang);
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
      const resultAction = await dispatch(login(formData)).unwrap();

    
      
   console.log(resultAction,'resultAction')
   if(resultAction?.user?.role==='inspector'){
    navigate('/user-dashboard');
   }else{

     navigate('/dashboard');
   }
    } catch (error) {
      // Handle login errors
      setApiError(error || 'Login failed. Please try again.');
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <>
    <GlobalStyle isRTL={isRTL} />
    <LoginContainer isRTL={isRTL}>
      <Logo
        isRTL={isRTL}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/logo.png" alt="Mirsat Logo" />
        <span>مرســـاة MIRSAT</span>
      </Logo>

      <ContentWrapper isRTL={isRTL}>
        <LeftContent
          isRTL={isRTL}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1>{t.heading}</h1>
          <p>{t.subtitle}</p>
        </LeftContent>

        <LoginCard
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Title>{t.signInTitle}</Title>
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
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Input
                type="password"
                name="password"
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>

            <ForgotPassword to="/forgot-password">
              {t.forgotPassword}
            </ForgotPassword>

            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? t.signingInButton : t.signInButton}
            </SubmitButton>

            {/* <SignUpText>
              Don't have an account?
              <Link to="/register">Sign Up</Link>
            </SignUpText> */}
          </form>
        </LoginCard>
        
        <Footer>
          {t.copyright}
          <LanguageToggle 
            className={language === 'en' ? 'active' : ''} 
            onClick={() => toggleLanguage('en')}
          >
            {t.english}
          </LanguageToggle>
          <LanguageSeparator>|</LanguageSeparator>
          <LanguageToggle 
            className={language === 'ar' ? 'active' : ''} 
            onClick={() => toggleLanguage('ar')}
          >
            {t.arabic}
          </LanguageToggle>
        </Footer>
      </ContentWrapper>
    </LoginContainer>
    </>
  );
};

export default Login;