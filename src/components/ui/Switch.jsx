import React from 'react';
import styled from 'styled-components';

const SwitchContainer = styled.button`
  position: relative;
  width: ${props => props.width || '40px'};
  height: ${props => props.height || '20px'};
  background: ${props => props.checked ? 'var(--color-navy)' : '#e0e0e0'};
  border-radius: 20px;
  padding: 2px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    width: ${props => props.height ? `${parseInt(props.height) - 4}px` : '16px'};
    height: ${props => props.height ? `${parseInt(props.height) - 4}px` : '16px'};
    border-radius: 50%;
    background: white;
    transition: all 0.3s;
    transform: translateX(${props => props.checked ? 
      props.width ? `${parseInt(props.width) - parseInt(props.height)}px` : '20px' : 
      '0'});
  }
`;

const Switch = ({ 
  checked = false, 
  onChange,
  width = '40px',
  height = '20px'
}) => {
  return (
    <SwitchContainer 
      type="button"
      checked={checked}
      width={width}
      height={height}
      onClick={onChange}
      role="switch"
      aria-checked={checked}
    />
  );
};

export default Switch; 