import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import boat from '../assets/boat.jpeg';

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
`;

const Logo = styled(motion.div)`
  position: absolute;
  top: 2rem;
  right: 2rem;
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
`;

const BackButton = styled(Link)`
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  z-index: 3;

  &:hover {
    opacity: 0.8;
    transform: translateX(-5px);
  }
`;

const ForgotPasswordCard = styled(motion.div)`
  width: 400px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: white;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
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
  margin-bottom: 1.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  ` : `
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  `}
`;

const BackToLogin = styled(Link)`
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: white;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 3;
  color: rgba(255, 255, 255, 0.7);

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin: 0 0.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
`;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Please check your inbox.' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyle />
      <ForgotPasswordContainer>
        <Logo
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/logo.png" alt="Mirsat Logo" />
          <span>مرســـاة MIRSAT</span>
        </Logo>

        <BackButton to="/login">
          <ArrowLeft size={16} />
          Back to Login
        </BackButton>

        <ContentWrapper>
          <ForgotPasswordCard
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Title>{t('auth.resetPassword')}</Title>
            <Description>
              Enter your email address and we'll send you a link to reset your password.
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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormGroup>

                <SubmitButton
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </SubmitButton>
              </form>
            )}

            <BackToLogin to="/login">
              {emailSent ? 'Back to Login' : 'Remember your password? Sign in'}
            </BackToLogin>
          </ForgotPasswordCard>
        </ContentWrapper>

        <Footer>
          ©2025 Mirsat
          <Link to="/english">English</Link> |
          <Link to="/arabic">العربية</Link>
        </Footer>
      </ForgotPasswordContainer>
    </>
  );
};

export default ForgotPassword; 