import React from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, XCircle, Slash } from 'lucide-react';

const ResponseContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.vertical ? 'column' : 'row'};
  gap: ${props => props.vertical ? '8px' : '12px'};
  width: 100%;
`;

const ResponseOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  background-color: ${props => props.selected ? props.selectedBg : 'white'};
  border: 1px solid ${props => props.selected ? props.selectedBorder : 'var(--color-gray-light)'};
  color: ${props => props.selected ? 'white' : 'var(--color-gray-dark)'};
  font-weight: ${props => props.selected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${props => props.vertical ? '100%' : 'auto'};
  justify-content: ${props => props.vertical ? 'flex-start' : 'center'};
  flex: ${props => props.vertical ? '0' : '1'};
  box-shadow: ${props => props.selected ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    background-color: ${props => props.selected ? props.selectedBg : 'var(--color-offwhite)'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    color: ${props => props.selected ? 'white' : props.iconColor};
  }
`;

const ComplianceResponseSelector = ({ 
  value, 
  onChange, 
  vertical = false,
  showLabels = true,
  disabled = false
}) => {
  const handleSelect = (newValue) => {
    if (!disabled) {
      onChange(newValue);
    }
  };
  
  return (
    <ResponseContainer vertical={vertical}>
      <ResponseOption
        selected={value === 'full_compliance'}
        selectedBg="var(--color-compliance-full)"
        selectedBorder="var(--color-compliance-full)"
        iconColor="var(--color-compliance-full)"
        onClick={() => handleSelect('full_compliance')}
        vertical={vertical}
        disabled={disabled}
      >
        <CheckCircle size={18} />
        {showLabels && <span>Full Compliance - نعم</span>}
      </ResponseOption>
      
      <ResponseOption
        selected={value === 'partial_compliance'}
        selectedBg="var(--color-compliance-partial)"
        selectedBorder="var(--color-compliance-partial)"
        iconColor="var(--color-compliance-partial)"
        onClick={() => handleSelect('partial_compliance')}
        vertical={vertical}
        disabled={disabled}
      >
        <AlertCircle size={18} />
        {showLabels && <span>Partial Compliance - جزئي</span>}
      </ResponseOption>
      
      <ResponseOption
        selected={value === 'non_compliance'}
        selectedBg="var(--color-compliance-non)"
        selectedBorder="var(--color-compliance-non)"
        iconColor="var(--color-compliance-non)"
        onClick={() => handleSelect('non_compliance')}
        vertical={vertical}
        disabled={disabled}
      >
        <XCircle size={18} />
        {showLabels && <span>Non Compliant - لا</span>}
      </ResponseOption>
      
      <ResponseOption
        selected={value === 'not_applicable'}
        selectedBg="var(--color-compliance-na)"
        selectedBorder="var(--color-compliance-na)"
        iconColor="var(--color-compliance-na)"
        onClick={() => handleSelect('not_applicable')}
        vertical={vertical}
        disabled={disabled}
      >
        <Slash size={18} />
        {showLabels && <span>Not Applicable - لا ينطبق</span>}
      </ResponseOption>
    </ResponseContainer>
  );
};

export default ComplianceResponseSelector; 