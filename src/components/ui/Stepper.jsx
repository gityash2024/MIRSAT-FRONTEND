import React from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';

const StepperContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    height: 2px;
    background: #e5e7eb;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    
    &:before {
      display: none;
    }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: row;
    gap: 12px;
    justify-content: flex-start;
  }
`;

const StepCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, var(--color-navy) 0%, #3f51b5 100%)' : props.completed ? '#4caf50' : 'white'};
  color: ${props => (props.active || props.completed) ? 'white' : '#9ca3af'};
  box-shadow: ${props => (props.active || props.completed) ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 2px 6px rgba(0, 0, 0, 0.05)'};
  border: 2px solid ${props => props.completed ? '#4caf50' : props.active ? 'var(--color-navy)' : '#e5e7eb'};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 16px rgba(0, 0, 0, 0.12)'};
  }
  
  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

const StepLine = styled.div`
  position: absolute;
  top: 24px;
  left: calc(50% + 24px);
  right: calc(50% - 24px);
  height: 2px;
  background: ${props => props.completed ? '#4caf50' : '#e5e7eb'};
  z-index: -1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const StepLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? 'var(--color-navy)' : props.completed ? '#4caf50' : '#6b7280'};
  text-align: center;
  
  @media (max-width: 768px) {
    text-align: left;
  }
`;

const StepperContent = styled.div`
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  border: 1px solid #e5e7eb;
`;

const Stepper = ({ steps, activeStep, setActiveStep, children, disabled = false }) => {
  return (
    <div>
      <StepperContainer>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Step>
              <StepCircle 
                active={activeStep === index} 
                completed={activeStep > index}
                onClick={() => !disabled && (index < activeStep || index === activeStep) && setActiveStep(index)}
                style={{ cursor: disabled || (index > activeStep) ? 'default' : 'pointer' }}
              >
                {activeStep > index ? <Check size={20} /> : index + 1}
              </StepCircle>
              <StepLabel active={activeStep === index} completed={activeStep > index}>
                {step}
              </StepLabel>
            </Step>
            {index < steps.length - 1 && (
              <StepLine completed={activeStep > index} />
            )}
          </React.Fragment>
        ))}
      </StepperContainer>
      <StepperContent>
        {children}
      </StepperContent>
    </div>
  );
};

export default Stepper; 