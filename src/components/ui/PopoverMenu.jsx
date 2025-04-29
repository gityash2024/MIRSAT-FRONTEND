import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuTrigger = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  color: ${props => props.color || '#64748b'};
  
  &:hover {
    color: ${props => props.hoverColor || 'var(--color-navy)'};
  }
`;

const MenuContent = styled.div`
  position: absolute;
  top: 100%;
  right: ${props => (props.align === 'right' ? '0' : 'auto')};
  left: ${props => (props.align === 'left' ? '0' : 'auto')};
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 150px;
  max-width: 300px;
  z-index: 100;
  margin-top: 4px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  
  &:hover {
    background: #f1f5f9;
  }
  
  ${props => props.danger && `
    color: #dc2626;
    &:hover {
      background: #fee2e2;
    }
  `}
`;

const PopoverMenu = ({ 
  trigger, 
  children, 
  align = 'right',
  color,
  hoverColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <MenuContainer ref={menuRef}>
      <MenuTrigger 
        onClick={() => setIsOpen(!isOpen)}
        color={color}
        hoverColor={hoverColor}
      >
        {trigger}
      </MenuTrigger>
      
      {isOpen && (
        <MenuContent align={align}>
          {children}
        </MenuContent>
      )}
    </MenuContainer>
  );
};

PopoverMenu.Item = MenuItem;

export default PopoverMenu; 