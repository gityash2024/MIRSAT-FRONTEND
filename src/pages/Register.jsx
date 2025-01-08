import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  TextField, 
  Button as MuiButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Typography 
} from '@mui/material';
import { register } from '../store/slices/authSlice';
import boat from '../assets/boat.jpeg';



const RegisterContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw; /* Updated to ensure full screen width */
  display: flex;
  flex-direction: column;
  align-items: center;
  background: url(${boat}) center/cover no-repeat fixed;
  background-size: cover; /* Ensures the image spans the entire screen */
  overflow: hidden;
  box-sizing: border-box;

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
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  margin: 0 auto;
  box-sizing: border-box;
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

const RegisterCard = styled(motion.div)`
  width: 450px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  .MuiTextField-root, .MuiFormControl-root {
    margin-bottom: 1.5rem;
    width: 100%;
  }

  .MuiInputBase-root {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }

  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.5);
  }

  .MuiSelect-icon {
    color: rgba(255, 255, 255, 0.7);
  }
`;


const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const StyledButton = styled(MuiButton)`
  && {
    background: ${props => props.secondary ? 'transparent' : 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)'};
    color: white;
    border: ${props => props.secondary ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'};
    padding: 0.875rem;
    font-weight: 600;
    
    &:hover {
      background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)'};
      transform: translateY(-2px);
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
const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 2rem;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
    z-index: 0;
  }

  &::before {
    left: 0;
    width: calc(50% - 1rem);
  }

  &::after {
    right: 0;
    width: calc(50% - 1rem);
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1; /* Ensures steps appear above lines */
  color: ${(props) => (props.active ? 'white' : 'rgba(255, 255, 255, 0.5)')};

  .step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: ${(props) =>
      props.active
        ? 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)'
        : 'rgba(255, 255, 255, 0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    border: 1px solid
      ${(props) => (props.completed ? '#0056b3' : 'rgba(255, 255, 255, 0.2)')};
  }

  .step-label {
    font-size: 0.875rem;
  }
`;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'inspector'
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Details' },
    { number: 3, label: 'Complete' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 2rem;
  padding: 0 1rem;

  &::after {
    content: '';
    position: absolute;
    top: 1rem;
    left: 50px;
    right: 50px;
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    z-index: 0;
  }
`;

const StepProgressLine = styled.div`
  position: absolute;
  top: 1rem;
  left: 50px;
  height: 2px;
  background: linear-gradient(135deg, #0056b3 0%, #007bff 100%);
  z-index: 1;
  transition: width 0.3s ease;
  width: ${props => {
    if (props.currentStep === 1) return '0%';
    if (props.currentStep === 2) return '50%';
    return '100%';
  }};
`;

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 2) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.role) newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      try {
        await dispatch(register(formData)).unwrap();
        navigate('/login');
      } catch (error) {
        setErrors({
          submit: error.message || 'Registration failed. Please try again.'
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
          </>
        );
      case 2:
        return (
          <>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="inspector">Inspector</MenuItem>
                <MenuItem value="management">Management</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 3:
        return (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Review Your Information</Typography>
            <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Role: {formData.role}</Typography>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <RegisterContainer>
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
          <h1>Join our marine services platform.</h1>
          <p>Create an account to access our digital marine services solutions.</p>
        </LeftContent>

        <RegisterCard
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Typography variant="h5" component="h2" style={{ color: 'white', marginBottom: '2rem' }}>
            Create your account
          </Typography>
          
          <StepIndicator>
            {steps.map((step) => (
              <Step 
                key={step.number}
                active={currentStep === step.number}
                completed={currentStep > step.number}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-label">{step.label}</div>
              </Step>
            ))}
          </StepIndicator>

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {errors.submit && (
              <Typography color="error" style={{ marginTop: '1rem' }}>
                {errors.submit}
              </Typography>
            )}

            <ButtonGroup>
              {currentStep > 1 && (
                <StyledButton
                  type="button"
                  onClick={handleBack}
                  secondary
                  fullWidth
                >
                  Back
                </StyledButton>
              )}
              
              {currentStep < 3 ? (
                <StyledButton
                  type="button"
                  onClick={handleNext}
                  fullWidth
                >
                  Next
                </StyledButton>
              ) : (
                <StyledButton
                  type="submit"
                  fullWidth
                >
                  Complete Registration
                </StyledButton>
              )}
            </ButtonGroup>

            <Typography 
              variant="body2" 
              style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </form>
        </RegisterCard>
      </ContentWrapper>

      <Footer>
        ©2025 Mirsat
        <Link to="/english">English</Link> |
        <Link to="/arabic">العربية</Link>
      </Footer>
    </RegisterContainer>
  );
};

export default Register;