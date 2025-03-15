import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import boat from '../assets/boat.jpeg';
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    overflow: hidden; /* Prevent unnecessary scroll */
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  input {
    padding: 1rem; /* Equal padding from all sides */
    margin: 0; /* Remove default margin */
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

const LeftContent = styled(motion.div)`
  flex: 1;
  max-width: 600px;
  color: white;
  padding-right: 4rem;

  h1 {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  p {
    font-size: 1.5rem;
    opacity: 0.9;
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
`;

const Title = styled.h2`
  color: white;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 2rem;
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

const ErrorMessage = styled.span`
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
`;

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: white;
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

  &:hover {
    transform: translateY(-2px);
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
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    <GlobalStyle />
    <LoginContainer>
      <Logo
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/logo.png" alt="Mirsat Logo" />
        <span>مرســـاة MIRSAT</span>
      </Logo>

      <ContentWrapper>
        <LeftContent
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1>Marine services made easier and faster.</h1>
          <p>Simplify your marine services with an easy-to-use digital application.</p>
        </LeftContent>

        <LoginCard
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Title>Sign in to your account</Title>
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
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Input
                type="password"
                name="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
            </FormGroup>

            <ForgotPassword to="/forgot-password">
              Forgot password?
            </ForgotPassword>

            <SubmitButton
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </SubmitButton>

            {/* <SignUpText>
              Don't have an account?
              <Link to="/register">Sign Up</Link>
            </SignUpText> */}
          </form>
        </LoginCard>
      </ContentWrapper>

      <Footer>
        ©2025 Mirsat
        <Link to="/english">English</Link> |
        <Link to="/arabic">العربية</Link>
      </Footer>
    </LoginContainer>
    </>
  );
};

export default Login;