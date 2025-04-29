import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: inline-flex;
  animation: ${rotate} 1s linear infinite;
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  border-top-color: var(--color-navy);
`;

const Spinner = ({ size }) => {
  return <SpinnerContainer size={size} />;
};

export default Spinner; 